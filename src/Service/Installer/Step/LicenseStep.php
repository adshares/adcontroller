<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\GeneralConfig;
use App\Entity\Enum\InstallerStepEnum;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Service\LicenseDecoder;
use App\Service\LicenseServerClient;
use App\ValueObject\License;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class LicenseStep implements InstallerStep
{
    private const LICENSE_KEY_PATTERN = '/^(COM|SRV)-[\da-z]{6}-[\da-z]{5}-[\da-z]{5}-[\da-z]{4}-[\da-z]{4}$/i';

    public function __construct(
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
        private readonly LicenseServerClient $licenseServerClient,
        private readonly LoggerInterface $logger
    ) {
    }

    public function process(array $content): void
    {
        if ($this->isDataRequired()) {
            throw new UnprocessableEntityHttpException('License key not set');
        }

        $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
    }

    public function setLicenseKey(array $content): void
    {
        $this->validate($content);

        $licenseKey = $content[AdServerConfig::LicenseKey->name];
        $this->adServerConfigurationClient->store([
            AdServerConfig::LicenseKey->name => $licenseKey,
        ]);

        $this->repository->insertOrUpdateOne(AdServerConfig::LicenseKey, $licenseKey);
        $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
    }

    private function validate(array $content): void
    {
        if (!isset($content[AdServerConfig::LicenseKey->name])) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` is required', AdServerConfig::LicenseKey->name)
            );
        }

        if (null === $this->getLicenseByKey($content[AdServerConfig::LicenseKey->name])) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid license key', AdServerConfig::LicenseKey->name)
            );
        }
    }

    public function getName(): string
    {
        return InstallerStepEnum::License->name;
    }

    public function fetchData(): array
    {
        $data = [
            Configuration::COMMON_DATA_REQUIRED => true,
        ];

        $licenseKey = $this->repository->fetchValueByEnum(AdServerConfig::LicenseKey);

        if (null !== ($license = $this->getLicenseByKey($licenseKey))) {
            $data[Configuration::COMMON_DATA_REQUIRED] = false;
            $data[Configuration::LICENSE_DATA] = $license->toArray();
        }

        return $data;
    }

    public function isDataRequired(): bool
    {
        $licenseKey = $this->repository->fetchValueByEnum(AdServerConfig::LicenseKey);

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
            $this->logger->debug('License is not valid');
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
        if (
            null === ($name = $this->repository->fetchValueByEnum(AdServerConfig::Name))
            || null === ($email = $this->repository->fetchValueByEnum(GeneralConfig::TechnicalEmail))
        ) {
            throw new UnprocessableEntityHttpException('Base step must be completed');
        }

        try {
            $licenseKey = $this->licenseServerClient->createCommunityLicense($email, $name);
        } catch (UnexpectedResponseException) {
            throw new UnprocessableEntityHttpException('License cannot be obtained');
        } catch (TransportExceptionInterface $exception) {
            $this->logger->critical(sprintf('License server is not accessible (%s)', $exception->getMessage()));
            throw new UnprocessableEntityHttpException('License server is not accessible');
        }

        $this->adServerConfigurationClient->store(
            [
                AdServerConfig::LicenseKey->name => $licenseKey,
            ]
        );

        $this->repository->insertOrUpdateOne(AdServerConfig::LicenseKey, $licenseKey);
        $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
    }
}
