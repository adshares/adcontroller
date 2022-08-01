<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdClassifyConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\GeneralConfig;
use App\Entity\Enum\InstallerStepEnum;
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
        private readonly string $adclassifyBaseUri,
        private readonly AdClassifyClient $adClassifyClient,
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
        private readonly LoggerInterface $logger
    ) {
    }

    public function process(array $content): void
    {
        if (!$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(AppConfig::INSTALLER_STEP, $this->getName());
            return;
        }

        if (null === ($name = $this->repository->fetchValueByEnum(AdServerConfig::NAME))) {
            throw new UnprocessableEntityHttpException('AdServer\'s name must be set');
        }
        if (null === ($email = $this->repository->fetchValueByEnum(GeneralConfig::BASE_TECHNICAL_EMAIL))) {
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

        $this->adServerConfigurationClient->setupAdClassify(
            $this->adclassifyBaseUri,
            $apiKey['name'],
            $apiKey['secret']
        );

        $this->repository->insertOrUpdate(
            AdClassifyConfig::MODULE,
            [
                AdClassifyConfig::API_KEY_NAME->value => $apiKey['name'],
                AdClassifyConfig::API_KEY_SECRET->value => $apiKey['secret'],
            ]
        );
        $this->repository->insertOrUpdateOne(AppConfig::INSTALLER_STEP, $this->getName());
    }

    public function getName(): string
    {
        return InstallerStepEnum::Classifier->name;
    }

    public function fetchData(): array
    {
        $isDataRequired = $this->isDataRequired();

        if (
            $isDataRequired
            && (
                null === $this->repository->fetchValueByEnum(AdServerConfig::NAME)
                || null === $this->repository->fetchValueByEnum(GeneralConfig::BASE_TECHNICAL_EMAIL)
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
        $requiredKeys = [
            AdClassifyConfig::API_KEY_NAME->value,
            AdClassifyConfig::API_KEY_SECRET->value,
        ];
        $configuration = $this->repository->fetchValuesByNames(AdClassifyConfig::MODULE, $requiredKeys);

        foreach ($requiredKeys as $requiredKey) {
            if (!isset($configuration[$requiredKey])) {
                return true;
            }
        }

        return false;
    }
}
