<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\LicenseDecoder;
use App\Service\LicenseServerClient;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class LicenseStep implements InstallerStep
{
    private const FIELDS = [
        Configuration::LICENSE_CONTACT_EMAIL,
    ];

    private ConfigurationRepository $repository;
    private LicenseServerClient $licenseServerClient;

    public function __construct(ConfigurationRepository $repository, LicenseServerClient $licenseServerClient)
    {
        $this->repository = $repository;
        $this->licenseServerClient = $licenseServerClient;
    }

    public function process(array $content): void
    {
        if (null === ($name = $this->repository->fetchValueByName(Configuration::BASE_ADSERVER_NAME))) {
            throw new UnprocessableEntityHttpException('AdServer\'s name must be set');
        }

        $this->validate($content);

        $message = $content[Configuration::LICENSE_CONTACT_EMAIL];
        $secret = $this->licenseServerClient->createCommunityLicense($message, $name);

        $this->repository->insertOrUpdate(
            [
                Configuration::INSTALLER_STEP => $this->getName(),
                Configuration::LICENSE_CONTACT_EMAIL => $message,
                Configuration::LICENSE_SECRET => $secret,
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
        $data = $this->repository->fetchValuesByNames([
            Configuration::BASE_ADSERVER_NAME,
            Configuration::BASE_CONTACT_EMAIL,
            Configuration::LICENSE_CONTACT_EMAIL,
            Configuration::LICENSE_SECRET,
        ]);

        if (null !== ($secret = $data[Configuration::LICENSE_SECRET] ?? null)) {
            unset($data[Configuration::LICENSE_SECRET]);

            $id = substr($secret, 0, 10);
            $encodedData = $this->licenseServerClient->fetchEncodedLicenseData($id);
            $license = (new LicenseDecoder($secret))->decode($encodedData);
            $data[Configuration::LICENSE_END_DATE] = $license->getEndDate();
            $data[Configuration::LICENSE_OWNER] = $license->getOwner();
            $data[Configuration::LICENSE_START_DATE] = $license->getStartDate();
            $data[Configuration::LICENSE_TYPE] = $license->getType();
        }

        return $data;
    }
}
