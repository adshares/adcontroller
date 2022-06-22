<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class BaseStep implements InstallerStep
{
    private const FIELDS = [
        Configuration::BASE_ADSERVER_NAME,
        Configuration::BASE_CONTACT_EMAIL,
        Configuration::BASE_DOMAIN,
        Configuration::BASE_SUPPORT_EMAIL,
    ];

    private ConfigurationRepository $repository;

    public function __construct(ConfigurationRepository $repository)
    {
        $this->repository = $repository;
    }

    public function process(array $content): void
    {
        $this->validate($content);

        $data = [];
        foreach (self::FIELDS as $field) {
            $data[$field] = $content[$field];
        }
        $data[Configuration::INSTALLER_STEP] = $this->getName();
        $this->repository->insertOrUpdate($data);
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }

        if (!filter_var($content[Configuration::BASE_CONTACT_EMAIL], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', Configuration::BASE_CONTACT_EMAIL)
            );
        }
        if (!filter_var($content[Configuration::BASE_SUPPORT_EMAIL], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', Configuration::BASE_SUPPORT_EMAIL)
            );
        }
        if (!filter_var($content[Configuration::BASE_DOMAIN], FILTER_VALIDATE_DOMAIN)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a domain', Configuration::BASE_DOMAIN)
            );
        }
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_BASE;
    }

    public function fetchData(): array
    {
        return $this->repository->fetchValuesByNames([
            Configuration::BASE_ADSERVER_NAME,
            Configuration::BASE_CONTACT_EMAIL,
            Configuration::BASE_DOMAIN,
            Configuration::BASE_SUPPORT_EMAIL,
        ]);
    }
}
