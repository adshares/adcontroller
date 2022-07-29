<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdClassify;
use App\Entity\Enum\AdServer;
use App\Entity\Enum\App;
use App\Entity\Enum\General;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdClassifyClient;
use App\Service\AdServerConfigurationClient;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class ClassifierStep implements InstallerStep
{
    public function __construct(
        private readonly AdClassifyClient $adClassifyClient,
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
        private readonly LoggerInterface $logger
    ) {
    }

    public function process(array $content): void
    {
        if (!$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(App::INSTALLER_STEP, $this->getName());
            return;
        }

        if (null === ($name = $this->repository->fetchValueByEnum(AdServer::BASE_ADSERVER_NAME))) {
            throw new UnprocessableEntityHttpException('AdServer\'s name must be set');
        }
        if (null === ($email = $this->repository->fetchValueByEnum(General::BASE_TECHNICAL_EMAIL))) {
            throw new UnprocessableEntityHttpException('Technical e-mail must be set');
        }

        try {
            $apiKey = $this->adClassifyClient->createAccount($email, $name);
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        } catch (TransportExceptionInterface $exception) {
            $this->logger->critical(sprintf('AdClassify is not accessible (%s)', $exception->getMessage()));
            throw new UnprocessableEntityHttpException('AdClassify is not accessible');
        }

        $data = [
            Configuration::CLASSIFIER_API_KEY_NAME => $apiKey['name'],
            Configuration::CLASSIFIER_API_KEY_SECRET => $apiKey['secret'],
        ];
        $this->adServerConfigurationClient->store($data);

        $this->repository->insertOrUpdate(AdClassify::MODULE, $data);
        $this->repository->insertOrUpdateOne(App::INSTALLER_STEP, $this->getName());
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_CLASSIFIER;
    }

    public function fetchData(): array
    {
        $isDataRequired = $this->isDataRequired();

        if (
            $isDataRequired
            && (
                null === $this->repository->fetchValueByEnum(AdServer::BASE_ADSERVER_NAME)
                || null === $this->repository->fetchValueByEnum(General::BASE_TECHNICAL_EMAIL)
            )
        ) {
            throw new UnprocessableEntityHttpException('Base step must be completed');
        }

        return [
            Configuration::COMMON_DATA_REQUIRED => $isDataRequired,
        ];
    }

    public function isDataRequired(): bool
    {
        $enums = [
            AdClassify::CLASSIFIER_API_KEY_NAME,
            AdClassify::CLASSIFIER_API_KEY_SECRET,
        ];
        $module = $enums[0]->getModule();
        $requiredKeys = array_map(fn($enum) => $enum->value, $enums);
        $localConfiguration = $this->repository->fetchValuesByNames($module, $requiredKeys);

        foreach ($requiredKeys as $requiredKey) {
            if (!isset($localConfiguration[$requiredKey])) {
                return true;
            }
        }

        $remoteConfiguration = $this->adServerConfigurationClient->fetch();
        if (
            !isset($remoteConfiguration[Configuration::CLASSIFIER_API_KEY_NAME])
            || (
                $remoteConfiguration[Configuration::CLASSIFIER_API_KEY_NAME]
                !== $localConfiguration[Configuration::CLASSIFIER_API_KEY_NAME]
            )
        ) {
            return true;
        }

        return false;
    }
}
