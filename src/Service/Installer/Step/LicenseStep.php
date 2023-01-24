<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\GeneralConfig;
use App\Entity\Enum\InstallerStepEnum;
use App\Exception\OutdatedLicense;
use App\Exception\ServiceNotPresent;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Service\Configurator\Category\License as LicenseConfigurator;
use App\Service\LicenseReader;
use App\Service\LicenseServerClient;
use App\ValueObject\License;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class LicenseStep implements InstallerStep
{
    public function __construct(
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
        private readonly LicenseConfigurator $licenseConfigurator,
        private readonly LicenseReader $licenseReader,
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
        $this->licenseConfigurator->process($content);
        $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
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

        if (null !== $licenseKey && null !== ($license = $this->getLicenseByKey($licenseKey))) {
            $data[Configuration::COMMON_DATA_REQUIRED] = false;
            $data[Configuration::LICENSE_DATA] = $license->toArray();
        }

        return $data;
    }

    public function isDataRequired(): bool
    {
        $licenseKey = $this->repository->fetchValueByEnum(AdServerConfig::LicenseKey);

        return null === $licenseKey || null === $this->getLicenseByKey($licenseKey);
    }

    private function getLicenseByKey(string $licenseKey): ?License
    {
        try {
            $license = $this->licenseReader->read($licenseKey);
        } catch (OutdatedLicense | ServiceNotPresent | UnexpectedResponseException) {
            return null;
        }

        return $license;
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
