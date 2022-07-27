<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\EnvEditor;
use App\Service\LicenseDecoder;
use App\Service\LicenseServerClient;
use App\Service\ServicePresenceChecker;
use App\ValueObject\License;
use App\ValueObject\Module;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class LicenseStep implements InstallerStep
{
    private const LICENSE_KEY_PATTERN = '/^(COM|SRV)-[\da-z]{6}-[\da-z]{5}-[\da-z]{5}-[\da-z]{4}-[\da-z]{4}$/i';

    private ConfigurationRepository $repository;
    private LicenseServerClient $licenseServerClient;
    private LoggerInterface $logger;
    private ServicePresenceChecker $servicePresenceChecker;

    public function __construct(
        ConfigurationRepository $repository,
        LicenseServerClient $licenseServerClient,
        LoggerInterface $logger,
        ServicePresenceChecker $servicePresenceChecker
    ) {
        $this->repository = $repository;
        $this->licenseServerClient = $licenseServerClient;
        $this->logger = $logger;
        $this->servicePresenceChecker = $servicePresenceChecker;
    }

    public function process(array $content): void
    {
        if ($this->isDataRequired()) {
            throw new UnprocessableEntityHttpException('License key not set');
        }

        $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $this->getName());
    }

    public function setLicenseKey(array $content): void
    {
        $this->validate($content);

        $licenseKey = $content[Configuration::LICENSE_KEY];
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $envEditor->setOne(EnvEditor::ADSERVER_ADSHARES_LICENSE_KEY, $licenseKey);

        $this->repository->insertOrUpdate(
            [
                Configuration::INSTALLER_STEP => $this->getName(),
                Configuration::LICENSE_KEY => $licenseKey,
            ]
        );
    }

    private function validate(array $content): void
    {
        if (!isset($content[Configuration::LICENSE_KEY])) {
            throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', Configuration::LICENSE_KEY));
        }

        if (null === $this->getLicenseByKey($content[Configuration::LICENSE_KEY])) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid license key', Configuration::LICENSE_KEY)
            );
        }
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_LICENSE;
    }

    public function fetchData(): array
    {
        $data = [
            Configuration::COMMON_DATA_REQUIRED => true,
        ];

        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $licenseKey = $envEditor->getOne(EnvEditor::ADSERVER_ADSHARES_LICENSE_KEY);

        if (null !== ($license = $this->getLicenseByKey($licenseKey))) {
            $data[Configuration::COMMON_DATA_REQUIRED] = false;
            $data[Configuration::LICENSE_DATA] = $license->toArray();
        }

        return $data;
    }

    public function isDataRequired(): bool
    {
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $licenseKey = $envEditor->getOne(EnvEditor::ADSERVER_ADSHARES_LICENSE_KEY);

        return null === $this->getLicenseByKey($licenseKey);
    }

    private function getLicenseByKey($licenseKey): ?License
    {
        if (!is_string($licenseKey) || 1 !== preg_match(self::LICENSE_KEY_PATTERN, $licenseKey)) {
            $this->logger->debug('Invalid license key format');
            return null;
        }

        try {
            $encodedData = $this->licenseServerClient->fetchEncodedLicenseData($this->getLicenseIdFromKey($licenseKey));
        } catch (UnexpectedResponseException $exception) {
            $this->logger->debug(sprintf('Unexpected response from license server (%s)', $exception->getMessage()));
            return null;
        } catch (TransportExceptionInterface $exception) {
            $this->logger->critical(sprintf('License server is not accessible (%s)', $exception->getMessage()));
            return null;
        }

        try {
            $license = (new LicenseDecoder($licenseKey))->decode($encodedData);
        } catch (RuntimeException $exception) {
            $this->logger->debug(sprintf('License cannot be decoded (%s)', $exception->getMessage()));
            return null;
        }

        if (!$license->isValid()) {
            return null;
        }

        return $license;
    }

    private function getLicenseIdFromKey(string $licenseKey): string
    {
        return substr($licenseKey, 0, 10);
    }

    public function claimCommunityLicense(): void
    {
        $localData = $this->repository->fetchValuesByNames([
            Configuration::BASE_ADSERVER_NAME,
            Configuration::BASE_TECHNICAL_EMAIL,
        ]);

        if (
            !isset($localData[Configuration::BASE_ADSERVER_NAME])
            || !isset($localData[Configuration::BASE_TECHNICAL_EMAIL])
        ) {
            throw new UnprocessableEntityHttpException('Base step must be completed');
        }

        $email = $localData[Configuration::BASE_TECHNICAL_EMAIL];
        $name = $localData[Configuration::BASE_ADSERVER_NAME];
        try {
            $licenseKey = $this->licenseServerClient->createCommunityLicense($email, $name);
        } catch (UnexpectedResponseException) {
            throw new UnprocessableEntityHttpException('License cannot be obtained');
        } catch (TransportExceptionInterface $exception) {
            $this->logger->critical(sprintf('License server is not accessible (%s)', $exception->getMessage()));
            throw new UnprocessableEntityHttpException('License server is not accessible');
        }

        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $envEditor->setOne(EnvEditor::ADSERVER_ADSHARES_LICENSE_KEY, $licenseKey);

        $this->repository->insertOrUpdate(
            [
                Configuration::INSTALLER_STEP => $this->getName(),
                Configuration::LICENSE_KEY => $licenseKey,
            ]
        );
    }
}
