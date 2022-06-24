<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\EnvEditor;
use App\Service\LicenseDecoder;
use App\Service\LicenseServerClient;
use App\Service\ServicePresenceChecker;
use App\ValueObject\Module;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class LicenseStep implements InstallerStep
{
    private const DEFAULT_ENV_ADSHARES_LICENSE_KEY = 'SRV-000000';
    private const FIELDS = [
        Configuration::LICENSE_CONTACT_EMAIL,
    ];

    private ConfigurationRepository $repository;
    private LicenseServerClient $licenseServerClient;
    private ServicePresenceChecker $servicePresenceChecker;

    public function __construct(
        ConfigurationRepository $repository,
        LicenseServerClient $licenseServerClient,
        ServicePresenceChecker $servicePresenceChecker
    ) {
        $this->repository = $repository;
        $this->licenseServerClient = $licenseServerClient;
        $this->servicePresenceChecker = $servicePresenceChecker;
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $this->getName());
            return;
        }

        if (null === ($name = $this->repository->fetchValueByName(Configuration::BASE_ADSERVER_NAME))) {
            throw new UnprocessableEntityHttpException('AdServer\'s name must be set');
        }

        $this->validate($content);

        $message = $content[Configuration::LICENSE_CONTACT_EMAIL];
        $licenseKey = $this->licenseServerClient->createCommunityLicense($message, $name);

        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $envEditor->setOne(EnvEditor::ADSERVER_ADSHARES_LICENSE_KEY, $licenseKey);

        $this->repository->insertOrUpdate(
            [
                Configuration::INSTALLER_STEP => $this->getName(),
                Configuration::LICENSE_CONTACT_EMAIL => $message,
                Configuration::LICENSE_KEY => $licenseKey,
            ]
        );
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }
        if (!filter_var($content[Configuration::LICENSE_CONTACT_EMAIL], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', Configuration::LICENSE_CONTACT_EMAIL)
            );
        }
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_LICENSE;
    }

    public function fetchData(): array
    {
        $localData = $this->repository->fetchValuesByNames([
            Configuration::BASE_ADSERVER_NAME,
            Configuration::BASE_CONTACT_EMAIL,
            Configuration::LICENSE_CONTACT_EMAIL,
        ]);

        if (
            !isset($localData[Configuration::BASE_ADSERVER_NAME])
            || !isset($localData[Configuration::BASE_CONTACT_EMAIL])
        ) {
            throw new UnprocessableEntityHttpException('Base step must be completed');
        }

        $data = [
            Configuration::BASE_ADSERVER_NAME =>
                $localData[Configuration::BASE_ADSERVER_NAME],
            Configuration::LICENSE_CONTACT_EMAIL =>
                $localData[Configuration::LICENSE_CONTACT_EMAIL] ?? $localData[Configuration::BASE_CONTACT_EMAIL],
        ];

        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $licenseKey = $envEditor->getOne(EnvEditor::ADSERVER_ADSHARES_LICENSE_KEY);
        if ($this->isLicenseKeySet($licenseKey)) {
            $id = substr($licenseKey, 0, 10);
            $encodedData = $this->licenseServerClient->fetchEncodedLicenseData($id);
            $license = (new LicenseDecoder($licenseKey))->decode($encodedData);
            $data[Configuration::LICENSE_END_DATE] = $license->getEndDate();
            $data[Configuration::LICENSE_OWNER] = $license->getOwner();
            $data[Configuration::LICENSE_START_DATE] = $license->getStartDate();
            $data[Configuration::LICENSE_TYPE] = $license->getType();
        }

        return $data;
    }

    public function isDataRequired(): bool
    {
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $licenseKey = $envEditor->getOne(EnvEditor::ADSERVER_ADSHARES_LICENSE_KEY);

        return !$this->isLicenseKeySet($licenseKey);
    }

    private function isLicenseKeySet(?string $licenseKey): bool
    {
        return null !== $licenseKey && self::DEFAULT_ENV_ADSHARES_LICENSE_KEY !== $licenseKey;
    }
}
