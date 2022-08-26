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
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Psr\Log\LoggerInterface;

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
        AdServerConfigurationClient::ADSERVER_NAME => AdServerConfig::Name,
        AdServerConfigurationClient::ADSHARES_LICENSE_KEY => AdServerConfig::LicenseKey,
        AdServerConfigurationClient::ADSHARES_ADDRESS => AdServerConfig::WalletAddress,
        AdServerConfigurationClient::ADSHARES_NODE_HOST => AdServerConfig::WalletNodeHost,
        AdServerConfigurationClient::ADSHARES_NODE_PORT => AdServerConfig::WalletNodePort,
        AdServerConfigurationClient::ADSHARES_SECRET => AdServerConfig::WalletSecretKey,
        AdServerConfigurationClient::ALLOW_ZONE_IN_IFRAME => AdServerConfig::AllowZoneInIframe,
        AdServerConfigurationClient::AUTO_CONFIRMATION_ENABLED => AdServerConfig::AutoConfirmationEnabled,
        AdServerConfigurationClient::AUTO_REGISTRATION_ENABLED => AdServerConfig::AutoRegistrationEnabled,
        AdServerConfigurationClient::AUTO_WITHDRAWAL_LIMIT_ADS => AdServerConfig::AutoWithdrawalLimitAds,
        AdServerConfigurationClient::AUTO_WITHDRAWAL_LIMIT_BSC => AdServerConfig::AutoWithdrawalLimitBsc,
        AdServerConfigurationClient::AUTO_WITHDRAWAL_LIMIT_BTC => AdServerConfig::AutoWithdrawalLimitBtc,
        AdServerConfigurationClient::AUTO_WITHDRAWAL_LIMIT_ETH => AdServerConfig::AutoWithdrawalLimitEth,
        AdServerConfigurationClient::COLD_WALLET_ADDRESS => AdServerConfig::ColdWalletAddress,
        AdServerConfigurationClient::COLD_WALLET_IS_ACTIVE => AdServerConfig::ColdWalletIsActive,
        AdServerConfigurationClient::CRM_MAIL_ADDRESS_ON_CAMPAIGN_CREATED =>
            AdServerConfig::CrmMailAddressOnCampaignCreated,
        AdServerConfigurationClient::CRM_MAIL_ADDRESS_ON_SITE_ADDED => AdServerConfig::CrmMailAddressOnSiteAdded,
        AdServerConfigurationClient::CRM_MAIL_ADDRESS_ON_USER_REGISTERED =>
            AdServerConfig::CrmMailAddressOnUserRegistered,
        AdServerConfigurationClient::EMAIL_VERIFICATION_REQUIRED => AdServerConfig::EmailVerificationRequired,
        AdServerConfigurationClient::HOT_WALLET_MAX_VALUE => AdServerConfig::HotWalletMaxValue,
        AdServerConfigurationClient::HOT_WALLET_MIN_VALUE => AdServerConfig::HotWalletMinValue,
        AdServerConfigurationClient::INVENTORY_EXPORT_WHITELIST => AdServerConfig::InventoryExportWhitelist,
        AdServerConfigurationClient::INVENTORY_IMPORT_WHITELIST => AdServerConfig::InventoryImportWhitelist,
        AdServerConfigurationClient::INVENTORY_WHITELIST => AdServerConfig::InventoryWhitelist,
        AdServerConfigurationClient::MAX_PAGE_ZONES => AdServerConfig::MaxPageZones,
        AdServerConfigurationClient::OPERATOR_RX_FEE => AdServerConfig::OperatorRxFee,
        AdServerConfigurationClient::OPERATOR_TX_FEE => AdServerConfig::OperatorTxFee,
        AdServerConfigurationClient::REFERRAL_REFUND_ENABLED => AdServerConfig::ReferralRefundEnabled,
        AdServerConfigurationClient::REFERRAL_REFUND_COMMISSION => AdServerConfig::ReferralRefundCommission,
        AdServerConfigurationClient::REJECTED_DOMAINS => AdServerConfig::RejectedDomains,
        AdServerConfigurationClient::REGISTRATION_MODE => AdServerConfig::RegistrationMode,
        AdServerConfigurationClient::SITE_ACCEPT_BANNERS_MANUALLY => AdServerConfig::SiteAcceptBannersManually,
        AdServerConfigurationClient::SITE_CLASSIFIER_LOCAL_BANNERS => AdServerConfig::SiteClassifierLocalBanners,
        AdServerConfigurationClient::URL => AdServerConfig::Url,
        // AdUser
        AdServerConfigurationClient::ADUSER_BASE_URL => AdUserConfig::Url,
        AdServerConfigurationClient::ADUSER_INTERNAL_URL => AdUserConfig::InternalUrl,
        // General
        AdServerConfigurationClient::SUPPORT_CHAT => GeneralConfig::SupportChat,
        AdServerConfigurationClient::SUPPORT_EMAIL => GeneralConfig::SupportEmail,
        AdServerConfigurationClient::SUPPORT_TELEGRAM => GeneralConfig::SupportTelegram,
        AdServerConfigurationClient::TECHNICAL_EMAIL => GeneralConfig::TechnicalEmail,
        AdServerConfigurationClient::MAIL_SMTP_HOST => GeneralConfig::SmtpHost,
        AdServerConfigurationClient::MAIL_SMTP_PASSWORD => GeneralConfig::SmtpPassword,
        AdServerConfigurationClient::MAIL_SMTP_PORT => GeneralConfig::SmtpPort,
        AdServerConfigurationClient::MAIL_FROM_NAME => GeneralConfig::SmtpSender,
        AdServerConfigurationClient::MAIL_SMTP_USERNAME => GeneralConfig::SmtpUsername,
    ];
    private const PLACEHOLDER_KEY_MAP = [
        AdServerConfigurationClient::PLACEHOLDER_INDEX_DESCRIPTION => AdPanelConfig::PlaceholderIndexDescription,
        AdServerConfigurationClient::PLACEHOLDER_INDEX_KEYWORDS => AdPanelConfig::PlaceholderIndexKeywords,
        AdServerConfigurationClient::PLACEHOLDER_INDEX_META_TAGS => AdPanelConfig::PlaceholderIndexMetaTags,
        AdServerConfigurationClient::PLACEHOLDER_INDEX_TITLE => AdPanelConfig::PlaceholderIndexTitle,
        AdServerConfigurationClient::PLACEHOLDER_ROBOTS_TXT => AdPanelConfig::PlaceholderRobotsTxt,
        AdServerConfigurationClient::PLACEHOLDER_PRIVACY_POLICY => AdServerConfig::PrivacyPolicy,
        AdServerConfigurationClient::PLACEHOLDER_TERMS => AdServerConfig::Terms,
    ];

    public function __construct(
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function synchronizeData(): void
    {
        $adServerConfig = $this->adServerConfigurationClient->fetch();
        $config = self::map(self::KEY_MAP, $adServerConfig);

        $adServerPlaceholders = $this->adServerConfigurationClient->fetchPlaceholders();
        $placeholders = self::map(self::PLACEHOLDER_KEY_MAP, $adServerPlaceholders);

        $this->entityManager->getConnection()->beginTransaction();
        try {
            $this->store($config);
            $this->store($placeholders);
            $this->entityManager->commit();
        } catch (Exception $exception) {
            $this->logger->error(sprintf('Migration failed: (%s)', $exception->getMessage()));
            $this->entityManager->rollback();
            throw $exception;
        }
    }

    private static function map(array $keyMap, array $adServerConfig): array
    {
        $config = [];
        foreach ($keyMap as $adServerKey => $enum) {
            if (isset($adServerConfig[$adServerKey])) {
                $value = $adServerConfig[$adServerKey];
                if (is_array($value)) {
                    $value = join(',', $value);
                }
                $config[$enum->getModule()][$enum->name] = $value;
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
