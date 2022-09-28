<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\InstallerStepEnum;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdsCredentialsChecker;
use App\Service\Configurator\Category\Wallet;

class WalletStep implements InstallerStep
{
    public function __construct(
        private readonly AdsCredentialsChecker $adsCredentialsChecker,
        private readonly ConfigurationRepository $repository,
        private readonly Wallet $wallet,
    ) {
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
            return;
        }

        $this->wallet->process($content);
        $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
    }

    public function getName(): string
    {
        return InstallerStepEnum::Wallet->name;
    }

    public function fetchData(): array
    {
        $configuration = $this->repository->fetchValuesByNames(
            AdServerConfig::MODULE,
            [
                AdServerConfig::WalletAddress->name,
                AdServerConfig::WalletNodeHost->name,
                AdServerConfig::WalletNodePort->name,
            ]
        );
        $configuration[Configuration::COMMON_DATA_REQUIRED] = $this->isDataRequired();

        return $configuration;
    }

    public function isDataRequired(): bool
    {
        $requiredKeys = [
            AdServerConfig::WalletAddress->name,
            AdServerConfig::WalletNodeHost->name,
            AdServerConfig::WalletNodePort->name,
            AdServerConfig::WalletSecretKey->name,
        ];
        $configuration = $this->repository->fetchValuesByNames(AdServerConfig::MODULE, $requiredKeys, true);

        foreach ($requiredKeys as $requiredKey) {
            if (!isset($configuration[$requiredKey])) {
                return true;
            }
        }

        try {
            $this->adsCredentialsChecker->check(
                $configuration[AdServerConfig::WalletAddress->name],
                $configuration[AdServerConfig::WalletSecretKey->name],
                $configuration[AdServerConfig::WalletNodeHost->name],
                $configuration[AdServerConfig::WalletNodePort->name]
            );
        } catch (UnexpectedResponseException) {
            return true;
        }

        return false;
    }
}
