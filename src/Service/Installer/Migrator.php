<?php

namespace App\Service\Installer;

use App\Entity\Enum\AdClassify;
use App\Entity\Enum\AdPanel;
use App\Entity\Enum\AdPay;
use App\Entity\Enum\AdSelect;
use App\Entity\Enum\AdServer;
use App\Entity\Enum\AdUser;
use App\Entity\Enum\General;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;

class Migrator
{
    private const KEY_MAP = [
        // AdClassify
        AdServerConfigurationClient::CLASSIFIER_EXTERNAL_BASE_URL => AdClassify::URL,
        AdServerConfigurationClient::CLASSIFIER_EXTERNAL_API_KEY_NAME => AdClassify::API_KEY_NAME,
        AdServerConfigurationClient::CLASSIFIER_EXTERNAL_API_KEY_SECRET => AdClassify::API_KEY_SECRET,
        // AdPanel
        AdServerConfigurationClient::ADPANEL_URL => AdPanel::URL,
        // AdPay
        AdServerConfigurationClient::ADPAY_URL => AdPay::URL,
        // AdSelect
        AdServerConfigurationClient::ADSELECT_URL => AdSelect::URL,
        // AdServer
        AdServerConfigurationClient::URL => AdServer::URL,
        AdServerConfigurationClient::ADSERVER_NAME => AdServer::NAME,
        AdServerConfigurationClient::ADSHARES_LICENSE_KEY => AdServer::LICENSE_KEY,
        AdServerConfigurationClient::ADSHARES_ADDRESS => AdServer::WALLET_ADDRESS,
        AdServerConfigurationClient::ADSHARES_NODE_HOST => AdServer::WALLET_NODE_HOST,
        AdServerConfigurationClient::ADSHARES_NODE_PORT => AdServer::WALLET_NODE_PORT,
        AdServerConfigurationClient::ADSHARES_SECRET => AdServer::WALLET_SECRET_KEY,
        // AdUser
        AdServerConfigurationClient::ADUSER_BASE_URL => AdUser::URL,
        AdServerConfigurationClient::ADUSER_INTERNAL_URL => AdUser::INTERNAL_URL,
        // General
        AdServerConfigurationClient::SUPPORT_EMAIL => General::BASE_SUPPORT_EMAIL,
        AdServerConfigurationClient::TECHNICAL_EMAIL => General::BASE_TECHNICAL_EMAIL,
        AdServerConfigurationClient::MAIL_SMTP_HOST => General::SMTP_HOST,
        AdServerConfigurationClient::MAIL_SMTP_PASSWORD => General::SMTP_PASSWORD,
        AdServerConfigurationClient::MAIL_SMTP_PORT => General::SMTP_PORT,
        AdServerConfigurationClient::MAIL_FROM_NAME => General::SMTP_SENDER,
        AdServerConfigurationClient::MAIL_SMTP_USERNAME => General::SMTP_USERNAME,
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
