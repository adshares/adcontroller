<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;

class ClassifierStep implements InstallerStep
{
    private ConfigurationRepository $repository;

    public function __construct(ConfigurationRepository $repository)
    {
        $this->repository = $repository;
    }

    public function process(array $content): void
    {
        $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $this->getName());
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_CLASSIFIER;
    }

    public function fetchData(): array
    {
        return [];
    }
}
