<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;

class StatusStep implements InstallerStep
{
    private ConfigurationRepository $repository;

    public function __construct(ConfigurationRepository $repository)
    {
        $this->repository = $repository;
    }

    public function process(array $content): void
    {
        $this->repository->insertOrUpdate(
            [
                Configuration::INSTALLER_STEP => $this->getName(),
                Configuration::APP_STATE => Configuration::APP_STATE_INSTALLATION_COMPLETED,
            ]
        );
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_STATUS;
    }

    public function fetchData(): array
    {
        return [];
    }
}
