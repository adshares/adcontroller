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
        AdServerConfigurationClient::CLASSIFIER_EXTERNAL_BASE_URL => AdClassifyConfig::URL,
        AdServerConfigurationClient::CLASSIFIER_EXTERNAL_API_KEY_NAME => AdClassifyConfig::API_KEY_NAME,
        AdServerConfigurationClient::CLASSIFIER_EXTERNAL_API_KEY_SECRET => AdClassifyConfig::API_KEY_SECRET,
        // AdPanel
        AdServerConfigurationClient::ADPANEL_URL => AdPanelConfig::URL,
        // AdPay
        AdServerConfigurationClient::ADPAY_URL => AdPayConfig::URL,
        // AdSelect
        AdServerConfigurationClient::ADSELECT_URL => AdSelectConfig::URL,
        // AdServer
        AdServerConfigurationClient::URL => AdServerConfig::URL,
        AdServerConfigurationClient::ADSERVER_NAME => AdServerConfig::NAME,
        AdServerConfigurationClient::ADSHARES_LICENSE_KEY => AdServerConfig::LICENSE_KEY,
        AdServerConfigurationClient::ADSHARES_ADDRESS => AdServerConfig::WALLET_ADDRESS,
        AdServerConfigurationClient::ADSHARES_NODE_HOST => AdServerConfig::WALLET_NODE_HOST,
        AdServerConfigurationClient::ADSHARES_NODE_PORT => AdServerConfig::WALLET_NODE_PORT,
        AdServerConfigurationClient::ADSHARES_SECRET => AdServerConfig::WALLET_SECRET_KEY,
        // AdUser
        AdServerConfigurationClient::ADUSER_BASE_URL => AdUserConfig::URL,
        AdServerConfigurationClient::ADUSER_INTERNAL_URL => AdUserConfig::INTERNAL_URL,
        // General
        AdServerConfigurationClient::SUPPORT_EMAIL => GeneralConfig::BASE_SUPPORT_EMAIL,
        AdServerConfigurationClient::TECHNICAL_EMAIL => GeneralConfig::BASE_TECHNICAL_EMAIL,
        AdServerConfigurationClient::MAIL_SMTP_HOST => GeneralConfig::SMTP_HOST,
        AdServerConfigurationClient::MAIL_SMTP_PASSWORD => GeneralConfig::SMTP_PASSWORD,
        AdServerConfigurationClient::MAIL_SMTP_PORT => GeneralConfig::SMTP_PORT,
        AdServerConfigurationClient::MAIL_FROM_NAME => GeneralConfig::SMTP_SENDER,
        AdServerConfigurationClient::MAIL_SMTP_USERNAME => GeneralConfig::SMTP_USERNAME,
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
                $config[$enum->getModule()][$enum->value] = $adServerConfig[$adServerKey];
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
