<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdClassifyClient;
use App\Service\EnvEditor;
use App\Service\ServicePresenceChecker;
use App\ValueObject\Module;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class ClassifierStep implements InstallerStep
{
    private AdClassifyClient $adClassifyClient;
    private ConfigurationRepository $repository;
    private LoggerInterface $logger;
    private ServicePresenceChecker $servicePresenceChecker;

    public function __construct(
        AdClassifyClient $adClassifyClient,
        ConfigurationRepository $repository,
        LoggerInterface $logger,
        ServicePresenceChecker $servicePresenceChecker
    ) {
        $this->adClassifyClient = $adClassifyClient;
        $this->repository = $repository;
        $this->logger = $logger;
        $this->servicePresenceChecker = $servicePresenceChecker;
    }

    public function process(array $content): void
    {
        if (!$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $this->getName());
            return;
        }

        if (null === ($name = $this->repository->fetchValueByName(Configuration::BASE_ADSERVER_NAME))) {
            throw new UnprocessableEntityHttpException('AdServer\'s name must be set');
        }
        if (null === ($email = $this->repository->fetchValueByName(Configuration::BASE_CONTACT_EMAIL))) {
            throw new UnprocessableEntityHttpException('Contact e-mail must be set');
        }

        try {
            $apiKey = $this->adClassifyClient->createAccount($email, $name);
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        } catch (TransportExceptionInterface $exception) {
            $this->logger->critical(sprintf('AdClassify is not accessible (%s)', $exception->getMessage()));
            throw new UnprocessableEntityHttpException('AdClassify is not accessible');
        }

        $apiKeyName = $apiKey['name'];
        $apiKeySecret = $apiKey['secret'];

        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $envEditor->set([
            EnvEditor::ADSERVER_CLASSIFIER_EXTERNAL_API_KEY_NAME => $apiKeyName,
            EnvEditor::ADSERVER_CLASSIFIER_EXTERNAL_API_KEY_SECRET => $apiKeySecret,
        ]);

        $this->repository->insertOrUpdate(
            [
                Configuration::INSTALLER_STEP => $this->getName(),
                Configuration::CLASSIFIER_API_KEY_NAME => $apiKeyName,
                Configuration::CLASSIFIER_API_KEY_SECRET => $apiKeySecret,
            ]
        );
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_CLASSIFIER;
    }

    public function fetchData(): array
    {
        $isDataRequired = $this->isDataRequired();

        if ($isDataRequired) {
            $localData = $this->repository->fetchValuesByNames([
                Configuration::BASE_ADSERVER_NAME,
                Configuration::BASE_CONTACT_EMAIL,
            ]);

            if (
                !isset($localData[Configuration::BASE_ADSERVER_NAME])
                || !isset($localData[Configuration::BASE_CONTACT_EMAIL])
            ) {
                throw new UnprocessableEntityHttpException('Base step must be completed');
            }
        }

        return [
            Configuration::COMMON_DATA_REQUIRED => $isDataRequired,
        ];
    }

    public function isDataRequired(): bool
    {
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $values = $envEditor->get(
            [
                EnvEditor::ADSERVER_CLASSIFIER_EXTERNAL_API_KEY_NAME,
                EnvEditor::ADSERVER_CLASSIFIER_EXTERNAL_API_KEY_SECRET,
            ]
        );

        foreach ($values as $value) {
            if (!$value) {
                return true;
            }
        }

        return false;
    }
}
