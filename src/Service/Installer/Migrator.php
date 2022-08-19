<?php

namespace App\Service\Installer;

use App\Entity\Enum\AdClassifyConfig;
use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\AdPayConfig;
use App\Entity\Enum\AdSelectConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AdUserConfig;
use App\Entity\Enum\GeneralConfig;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;

class Migrator
{
    private const KEY_MAP = [
        // AdClassify
        AdServerConfigurationClient::CLASSIFIER_EXTERNAL_BASE_URL => AdClassifyConfig::Url,
        AdServerConfigurationClient::CLASSIFIER_EXTERNAL_API_KEY_NAME => AdClassifyConfig::ApiKeyName,
        AdServerConfigurationClient::CLASSIFIER_EXTERNAL_API_KEY_SECRET => AdClassifyConfig::ApiKeySecret,
        // AdPanel
        AdServerConfigurationClient::ADPANEL_URL => AdPanelConfig::Url,
        // AdPay
        AdServerConfigurationClient::ADPAY_URL => AdPayConfig::Url,
        // AdSelect
        AdServerConfigurationClient::ADSELECT_URL => AdSelectConfig::Url,
        // AdServer
        AdServerConfigurationClient::URL => AdServerConfig::Url,
        AdServerConfigurationClient::ADSERVER_NAME => AdServerConfig::Name,
        AdServerConfigurationClient::ADSHARES_LICENSE_KEY => AdServerConfig::LicenseKey,
        AdServerConfigurationClient::ADSHARES_ADDRESS => AdServerConfig::WalletAddress,
        AdServerConfigurationClient::ADSHARES_NODE_HOST => AdServerConfig::WalletNodeHost,
        AdServerConfigurationClient::ADSHARES_NODE_PORT => AdServerConfig::WalletNodePort,
        AdServerConfigurationClient::ADSHARES_SECRET => AdServerConfig::WalletSecretKey,
        AdServerConfigurationClient::COLD_WALLET_ADDRESS => AdServerConfig::ColdWalletAddress,
        AdServerConfigurationClient::COLD_WALLET_IS_ACTIVE => AdServerConfig::ColdWalletIsActive,
        AdServerConfigurationClient::HOT_WALLET_MAX_VALUE => AdServerConfig::HotWalletMaxValue,
        AdServerConfigurationClient::HOT_WALLET_MIN_VALUE => AdServerConfig::HotWalletMinValue,
        // AdUser
        AdServerConfigurationClient::ADUSER_BASE_URL => AdUserConfig::Url,
        AdServerConfigurationClient::ADUSER_INTERNAL_URL => AdUserConfig::InternalUrl,
        // General
        AdServerConfigurationClient::SUPPORT_EMAIL => GeneralConfig::SupportEmail,
        AdServerConfigurationClient::TECHNICAL_EMAIL => GeneralConfig::TechnicalEmail,
        AdServerConfigurationClient::MAIL_SMTP_HOST => GeneralConfig::SmtpHost,
        AdServerConfigurationClient::MAIL_SMTP_PASSWORD => GeneralConfig::SmtpPassword,
        AdServerConfigurationClient::MAIL_SMTP_PORT => GeneralConfig::SmtpPort,
        AdServerConfigurationClient::MAIL_FROM_NAME => GeneralConfig::SmtpSender,
        AdServerConfigurationClient::MAIL_SMTP_USERNAME => GeneralConfig::SmtpUsername,
    ];

    public function __construct(
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
    ) {
    }

    public function migrate(): void
    {
        $adServerConfig = $this->adServerConfigurationClient->fetch();

        $config = $this->map($adServerConfig);

        $this->store($config);
    }

    private function map(array $adServerConfig): array
    {
        $config = [];
        foreach (self::KEY_MAP as $adServerKey => $enum) {
            if (isset($adServerConfig[$adServerKey])) {
                $config[$enum->getModule()][$enum->name] = $adServerConfig[$adServerKey];
            }
        }
        return $config;
    }

    private function store(array $config): void
    {
        foreach ($config as $module => $data) {
            $this->repository->insertOrUpdate($module, $data);
        }
    }
}
