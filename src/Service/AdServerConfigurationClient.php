<?php

namespace App\Service;

use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\GeneralConfig;
use App\Exception\ServiceNotPresent;
use App\Exception\UnexpectedResponseException;
use InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\InputBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class AdServerConfigurationClient
{
    // Config
    public const ADPANEL_URL = 'adpanelUrl';
    private const ADPAY_BID_STRATEGY_EXPORT_TIME = 'adpayBidStrategyExport';
    private const ADPAY_CAMPAIGN_EXPORT_TIME = 'adpayCampaignExport';
    private const ADPAY_LAST_EXPORTED_CONVERSION_TIME = 'adpayLastConversionTime';
    private const ADPAY_LAST_EXPORTED_EVENT_TIME = 'adpayLastEventTime';
    public const ADPAY_URL = 'adpayUrl';
    private const ADS_LOG_START = 'adsLogStart';
    private const ADS_OPERATOR_SERVER_URL = 'adsOperatorServerUrl';
    private const ADS_RPC_URL = 'adsRpcUrl';
    public const ADS_TXT_CHECK_DEMAND_ENABLED = 'adsTxtCheckDemandEnabled';
    public const ADS_TXT_CHECK_SUPPLY_ENABLED = 'adsTxtCheckSupplyEnabled';
    public const ADS_TXT_DOMAIN = 'adsTxtDomain';
    private const ADSELECT_INVENTORY_EXPORT_TIME = 'adselectInventoryExport';
    public const ADSELECT_URL = 'adselectUrl';
    public const ADSERVER_NAME = 'adserverName';
    public const ADSHARES_ADDRESS = 'adsharesAddress';
    public const ADSHARES_LICENSE_KEY = 'adsharesLicenseKey';
    private const ADSHARES_LICENSE_SERVER_URL = 'adsharesLicenseServerUrl';
    public const ADSHARES_NODE_HOST = 'adsharesNodeHost';
    public const ADSHARES_NODE_PORT = 'adsharesNodePort';
    public const ADSHARES_SECRET = 'adsharesSecret';
    public const ADUSER_BASE_URL = 'aduserBaseUrl';
    private const ADUSER_INFO_URL = 'aduserInfoUrl';
    public const ADUSER_INTERNAL_URL = 'aduserInternalUrl';
    private const ADUSER_SERVE_SUBDOMAIN = 'aduserServeSubdomain';
    public const ADVERTISER_APPLY_FORM_URL = 'advertiserApplyFormUrl';
    public const ALLOW_ZONE_IN_IFRAME = 'allowZoneInIframe';
    public const AUTO_CONFIRMATION_ENABLED = 'autoConfirmationEnabled';
    public const AUTO_REGISTRATION_ENABLED = 'autoRegistrationEnabled';
    public const AUTO_WITHDRAWAL_LIMIT_ADS = 'autoWithdrawalLimitAds';
    public const AUTO_WITHDRAWAL_LIMIT_BSC = 'autoWithdrawalLimitBsc';
    public const AUTO_WITHDRAWAL_LIMIT_BTC = 'autoWithdrawalLimitBtc';
    public const AUTO_WITHDRAWAL_LIMIT_ETH = 'autoWithdrawalLimitEth';
    private const BANNER_FORCE_HTTPS = 'bannerForceHttps';
    public const BANNER_ROTATE_INTERVAL = 'bannerRotateInterval';
    private const BTC_WITHDRAW = 'btcWithdraw';
    private const BTC_WITHDRAW_FEE = 'btcWithdrawFee';
    private const BTC_WITHDRAW_MAX_AMOUNT = 'btcWithdrawMaxAmount';
    private const BTC_WITHDRAW_MIN_AMOUNT = 'btcWithdrawMinAmount';
    public const CAMPAIGN_BOOST_MIN_BUDGET = 'campaignBoostMinBudget';
    public const CAMPAIGN_BOOST_MIN_BUDGET_FOR_CPA_REQUIRED = 'campaignBoostMinBudgetForCpaRequired';
    public const CAMPAIGN_MIN_BUDGET = 'campaignMinBudget';
    public const CAMPAIGN_MIN_CPA = 'campaignMinCpa';
    public const CAMPAIGN_MIN_CPM = 'campaignMinCpm';
    private const CAMPAIGN_TARGETING_EXCLUDE = 'campaignTargetingExclude';
    private const CAMPAIGN_TARGETING_REQUIRE = 'campaignTargetingRequire';
    private const CDN_PROVIDER = 'cdnProvider';
    private const CHECK_ZONE_DOMAIN = 'checkZoneDomain';
    public const CLASSIFIER_EXTERNAL_API_KEY_NAME = 'classifierExternalApiKeyName';
    public const CLASSIFIER_EXTERNAL_API_KEY_SECRET = 'classifierExternalApiKeySecret';
    public const CLASSIFIER_EXTERNAL_BASE_URL = 'classifierExternalBaseUrl';
    private const CLASSIFIER_EXTERNAL_NAME = 'classifierExternalName';
    private const CLASSIFIER_EXTERNAL_PUBLIC_KEY = 'classifierExternalPublicKey';
    public const COLD_WALLET_ADDRESS = 'coldWalletAddress';
    public const COLD_WALLET_IS_ACTIVE = 'coldWalletIsActive';
    public const CRM_MAIL_ADDRESS_ON_CAMPAIGN_CREATED = 'crmMailAddressOnCampaignCreated';
    public const CRM_MAIL_ADDRESS_ON_SITE_ADDED = 'crmMailAddressOnSiteAdded';
    public const CRM_MAIL_ADDRESS_ON_USER_REGISTERED = 'crmMailAddressOnUserRegistered';
    private const CURRENCY = 'currency';
    public const DEFAULT_USER_ROLES = 'defaultUserRoles';
    private const DISPLAY_CURRENCY = 'displayCurrency';
    public const EMAIL_VERIFICATION_REQUIRED = 'emailVerificationRequired';
    private const EXCHANGE_API_KEY = 'exchangeApiKey';
    private const EXCHANGE_API_SECRET = 'exchangeApiSecret';
    private const EXCHANGE_API_URL = 'exchangeApiUrl';
    private const EXCHANGE_CURRENCIES = 'exchangeCurrencies';
    private const FIAT_DEPOSIT_MAX_AMOUNT = 'fiatDepositMaxAmount';
    private const FIAT_DEPOSIT_MIN_AMOUNT = 'fiatDepositMinAmount';
    public const HOT_WALLET_MAX_VALUE = 'hotwalletMaxValue';
    public const HOT_WALLET_MIN_VALUE = 'hotwalletMinValue';
    private const HOURS_UNTIL_INACTIVE_HOST_REMOVAL = 'hoursUntilInactiveHostRemoval';
    public const INVENTORY_EXPORT_WHITELIST = 'inventoryExportWhitelist';
    private const INVENTORY_FAILED_CONNECTION_LIMIT = 'inventoryFailedConnectionLimit';
    public const INVENTORY_IMPORT_WHITELIST = 'inventoryImportWhitelist';
    public const INVENTORY_WHITELIST = 'inventoryWhitelist';
    private const INVOICE_CURRENCIES = 'invoiceCurrencies';
    private const INVOICE_COMPANY_ADDRESS = 'invoiceCompanyAddress';
    private const INVOICE_COMPANY_BANK_ACCOUNTS = 'invoiceCompanyBankAccounts';
    private const INVOICE_COMPANY_CITY = 'invoiceCompanyCity';
    private const INVOICE_COMPANY_COUNTRY = 'invoiceCompanyCountry';
    private const INVOICE_COMPANY_NAME = 'invoiceCompanyName';
    private const INVOICE_COMPANY_POSTAL_CODE = 'invoiceCompanyPostalCode';
    private const INVOICE_COMPANY_VAT_ID = 'invoiceCompanyVatId';
    private const INVOICE_ENABLED = 'invoiceEnabled';
    private const INVOICE_NUMBER_FORMAT = 'invoiceNumberFormat';
    public const JOINING_FEE_ENABLED = 'joiningFeeEnabled';
    public const JOINING_FEE_MIN_VALUE = 'joiningFeeMinValue';
    public const JOINING_FEE_VALUE = 'joiningFeeValue';
    public const LANDING_URL = 'landingUrl';
    private const LAST_UPDATED_IMPRESSION_ID = 'lastUpdatedImpressionId';
    private const MAIL_FROM_ADDRESS = 'mailFromAddress';
    public const MAIL_FROM_NAME = 'mailFromName';
    private const MAIL_MAILER = 'mailMailer';
    private const MAIL_SMTP_ENCRYPTION = 'mailSmtpEncryption';
    public const MAIL_SMTP_HOST = 'mailSmtpHost';
    public const MAIL_SMTP_PASSWORD = 'mailSmtpPassword';
    public const MAIL_SMTP_PORT = 'mailSmtpPort';
    public const MAIL_SMTP_USERNAME = 'mailSmtpUsername';
    private const MAIN_JS_BASE_URL = 'mainJsBaseUrl';
    private const MAIN_JS_TLD = 'mainJsTld';
    private const MAX_INVALID_LOGIN_ATTEMPTS = 'maxInvalidLoginAttempts';
    public const MAX_PAGE_ZONES = 'maxPageZones';
    private const NETWORK_DATA_CACHE_TTL = 'networkDataCacheTtl';
    private const NOW_PAYMENTS_API_KEY = 'nowPaymentsApiKey';
    private const NOW_PAYMENTS_CURRENCY = 'nowPaymentsCurrency';
    private const NOW_PAYMENTS_EXCHANGE = 'nowPaymentsExchange';
    private const NOW_PAYMENTS_FEE = 'nowPaymentsFee';
    private const NOW_PAYMENTS_IPN_SECRET = 'nowPaymentsIpnSecret';
    private const NOW_PAYMENTS_MAX_AMOUNT = 'nowPaymentsMaxAmount';
    private const NOW_PAYMENTS_MIN_AMOUNT = 'nowPaymentsMinAmount';
    private const PANEL_PLACEHOLDER_NOTIFICATION_TIME = 'panelPlaceholderNotificationTime';
    private const PANEL_PLACEHOLDER_UPDATE_TIME = 'panelPlaceholderUpdateTime';
    public const PUBLISHER_APPLY_FORM_URL = 'publisherApplyFormUrl';
    public const REFERRAL_REFUND_COMMISSION = 'referralRefundCommission';
    public const REFERRAL_REFUND_ENABLED = 'referralRefundEnabled';
    public const REGISTRATION_MODE = 'registrationMode';
    public const OPERATOR_RX_FEE = 'paymentRxFee';
    public const OPERATOR_TX_FEE = 'paymentTxFee';
    private const OPERATOR_WALLET_EMAIL_LAST_TIME = 'operatorWalletTransferEmailTime';
    private const SERVE_BASE_URL = 'serveBaseUrl';
    public const SITE_ACCEPT_BANNERS_MANUALLY = 'siteAcceptBannersManually';
    public const SITE_CLASSIFIER_LOCAL_BANNERS = 'siteClassifierLocalBanners';
    private const SITE_FILTERING_EXCLUDE = 'siteFilteringExclude';
    private const SITE_FILTERING_REQUIRE = 'siteFilteringRequire';
    private const SITE_VERIFICATION_NOTIFICATION_TIME_THRESHOLD = 'siteVerificationTimeThreshold';
    public const SUPPLY_PLACEHOLDER_COLOR = 'supplyPlaceholderColor';
    public const SUPPLY_PLACEHOLDER_FILE = 'supplyPlaceholderFile';
    public const SUPPLY_SMART_LINK_ENABLED = 'supplySmartLinkEnabled';
    public const SUPPORT_CHAT = 'supportChat';
    public const SUPPORT_EMAIL = 'supportEmail';
    public const SUPPORT_TELEGRAM = 'supportTelegram';
    private const SKYNET_API_KEY = 'skynetApiKey';
    private const SKYNET_API_URL = 'skynetApiUrl';
    private const SKYNET_CDN_URL = 'skynetCdnUrl';
    public const TECHNICAL_EMAIL = 'technicalEmail';
    public const UPLOAD_LIMIT_IMAGE = 'uploadLimitImage';
    public const UPLOAD_LIMIT_MODEL = 'uploadLimitModel';
    public const UPLOAD_LIMIT_VIDEO = 'uploadLimitVideo';
    public const UPLOAD_LIMIT_ZIP = 'uploadLimitZip';
    public const URL = 'url';
    // PanelPlaceholder
    public const PLACEHOLDER_INDEX_DESCRIPTION = 'indexDescription';
    public const PLACEHOLDER_INDEX_KEYWORDS = 'indexKeywords';
    public const PLACEHOLDER_INDEX_META_TAGS = 'indexMetaTags';
    public const PLACEHOLDER_INDEX_TITLE = 'indexTitle';
    public const PLACEHOLDER_LOGIN_INFO = 'loginInfo';
    public const PLACEHOLDER_ROBOTS_TXT = 'robotsTxt';
    public const PLACEHOLDER_PRIVACY_POLICY = 'privacyPolicy';
    public const PLACEHOLDER_TERMS = 'terms';
    // SiteRejectedDomain
    public const REJECTED_DOMAINS = 'rejectedDomains';

    private const RESOURCE_CONFIG = 'config';
    private const RESOURCE_CONFIG_PLACEHOLDERS = 'config/placeholders';
    private const RESOURCE_CONFIG_REJECTED_DOMAINS = 'config/rejectedDomains';
    private const RESOURCE_HOSTS = 'hosts';
    private const RESOURCE_USERS = 'users';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly RequestStack $requestStack,
        private readonly string $adServerBaseUri
    ) {
    }

    public function fetch(): array
    {
        return $this->getData($this->buildUri(self::RESOURCE_CONFIG));
    }

    public function proxyMonitoringRequest(Request $request, string $resource): array
    {
        $data = $this->getData($this->buildUri($resource), $request->query);
        return self::overwriteUriInCaseOfPagination($data, $request);
    }

    public function fetchPlaceholders(): array
    {
        return $this->getData($this->buildUri(self::RESOURCE_CONFIG_PLACEHOLDERS));
    }

    public function fetchRejectedDomains(): array
    {
        return $this->getData($this->buildUri(self::RESOURCE_CONFIG_REJECTED_DOMAINS));
    }

    public function store(array $data): array
    {
        return $this->patchData($this->buildUri(self::RESOURCE_CONFIG), self::mapDataToAdServerFormat($data));
    }

    public function storePlaceholders(array $data): array
    {
        return $this->patchData(
            $this->buildUri(self::RESOURCE_CONFIG_PLACEHOLDERS),
            self::mapPlaceholderDataToAdServerFormat($data),
        );
    }

    public function storeRejectedDomains(array $data): array
    {
        return $this->patchData(
            $this->buildUri(self::RESOURCE_CONFIG_REJECTED_DOMAINS),
            self::mapDataToAdServerFormat($data),
        );
    }

    public function resetHostConnectionError(int $hostId): array
    {
        $uri = sprintf('%s/%d/reset', $this->buildUri(self::RESOURCE_HOSTS), $hostId);
        return $this->patchData($uri, []);
    }

    public function addUser(array $data): array
    {
        $uri = $this->buildUri(self::RESOURCE_USERS);
        return $this->postData($uri, $data);
    }

    public function editUser(int $userId, array $data): array
    {
        $uri = sprintf('%s/%d', $this->buildUri(self::RESOURCE_USERS), $userId);
        return $this->patchData($uri, $data);
    }

    public function patchUser(int $userId, string $action, array $data): array
    {
        $uri = sprintf('%s/%d/%s', $this->buildUri(self::RESOURCE_USERS), $userId, $action);
        return $this->patchData($uri, $data);
    }

    public function deleteUser(int $userId): void
    {
        $uri = sprintf('%s/%d', $this->buildUri(self::RESOURCE_USERS), $userId);
        $this->deleteData($uri);
    }

    private function buildUri(string $resource): string
    {
        return sprintf('%s/api/v2/%s', $this->adServerBaseUri, $resource);
    }

    private function getRequestHeaders(): array
    {
        return [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $this->requestStack->getSession()->get('accessToken'),
        ];
    }

    private static function overwriteUriInCaseOfPagination(array $data, Request $request): array
    {
        if (isset($data['path'])) {
            $remoteUri = $data['path'];
            $localUri = strtok($request->getUri(), '?');
            $data['path'] = $localUri;
            foreach (['nextPageUrl', 'prevPageUrl', 'firstPageUrl', 'lastPageUrl'] as $urlKey) {
                if (isset($data[$urlKey])) {
                    $data[$urlKey] = str_replace($remoteUri, $localUri, $data[$urlKey]);
                }
            }
        }
        return $data;
    }

    private static function mapDataToAdServerFormat(array $data): array
    {
        $keyMap = [
            AdServerConfig::AdsTxtCheckDemandEnabled->name => self::ADS_TXT_CHECK_DEMAND_ENABLED,
            AdServerConfig::AdsTxtCheckSupplyEnabled->name => self::ADS_TXT_CHECK_SUPPLY_ENABLED,
            AdServerConfig::AdsTxtDomain->name => self::ADS_TXT_DOMAIN,
            AdServerConfig::AdvertiserApplyFormUrl->name => self::ADVERTISER_APPLY_FORM_URL,
            AdServerConfig::AllowZoneInIframe->name => self::ALLOW_ZONE_IN_IFRAME,
            AdServerConfig::AutoConfirmationEnabled->name => self::AUTO_CONFIRMATION_ENABLED,
            AdServerConfig::AutoRegistrationEnabled->name => self::AUTO_REGISTRATION_ENABLED,
            AdServerConfig::AutoWithdrawalLimitAds->name => self::AUTO_WITHDRAWAL_LIMIT_ADS,
            AdServerConfig::AutoWithdrawalLimitBsc->name => self::AUTO_WITHDRAWAL_LIMIT_BSC,
            AdServerConfig::AutoWithdrawalLimitBtc->name => self::AUTO_WITHDRAWAL_LIMIT_BTC,
            AdServerConfig::AutoWithdrawalLimitEth->name => self::AUTO_WITHDRAWAL_LIMIT_ETH,
            AdServerConfig::BannerRotateInterval->name => self::BANNER_ROTATE_INTERVAL,
            AdServerConfig::CampaignMinBudget->name => self::CAMPAIGN_MIN_BUDGET,
            AdServerConfig::CampaignBoostMinBudget->name => self::CAMPAIGN_BOOST_MIN_BUDGET,
            AdServerConfig::CampaignMinCpa->name => self::CAMPAIGN_MIN_CPA,
            AdServerConfig::CampaignMinCpm->name => self::CAMPAIGN_MIN_CPM,
            AdServerConfig::ColdWalletAddress->name => self::COLD_WALLET_ADDRESS,
            AdServerConfig::ColdWalletIsActive->name => self::COLD_WALLET_IS_ACTIVE,
            AdServerConfig::CrmMailAddressOnCampaignCreated->name => self::CRM_MAIL_ADDRESS_ON_CAMPAIGN_CREATED,
            AdServerConfig::CrmMailAddressOnSiteAdded->name => self::CRM_MAIL_ADDRESS_ON_SITE_ADDED,
            AdServerConfig::CrmMailAddressOnUserRegistered->name => self::CRM_MAIL_ADDRESS_ON_USER_REGISTERED,
            AdServerConfig::DefaultUserRoles->name => self::DEFAULT_USER_ROLES,
            AdServerConfig::EmailVerificationRequired->name => self::EMAIL_VERIFICATION_REQUIRED,
            AdServerConfig::HotWalletMaxValue->name => self::HOT_WALLET_MAX_VALUE,
            AdServerConfig::HotWalletMinValue->name => self::HOT_WALLET_MIN_VALUE,
            AdServerConfig::InventoryExportWhitelist->name => self::INVENTORY_EXPORT_WHITELIST,
            AdServerConfig::InventoryImportWhitelist->name => self::INVENTORY_IMPORT_WHITELIST,
            AdServerConfig::InventoryWhitelist->name => self::INVENTORY_WHITELIST,
            AdServerConfig::JoiningFeeEnabled->name => self::JOINING_FEE_ENABLED,
            AdServerConfig::JoiningFeeMinValue->name => self::JOINING_FEE_MIN_VALUE,
            AdServerConfig::JoiningFeeValue->name => self::JOINING_FEE_VALUE,
            AdServerConfig::LandingUrl->name => self::LANDING_URL,
            AdServerConfig::LicenseKey->name => self::ADSHARES_LICENSE_KEY,
            AdServerConfig::Name->name => self::ADSERVER_NAME,
            AdServerConfig::MaxPageZones->name => self::MAX_PAGE_ZONES,
            AdServerConfig::OperatorRxFee->name => self::OPERATOR_RX_FEE,
            AdServerConfig::OperatorTxFee->name => self::OPERATOR_TX_FEE,
            AdServerConfig::PublisherApplyFormUrl->name => self::PUBLISHER_APPLY_FORM_URL,
            AdServerConfig::ReferralRefundCommission->name => self::REFERRAL_REFUND_COMMISSION,
            AdServerConfig::ReferralRefundEnabled->name => self::REFERRAL_REFUND_ENABLED,
            AdServerConfig::RegistrationMode->name => self::REGISTRATION_MODE,
            AdServerConfig::RejectedDomains->name => self::REJECTED_DOMAINS,
            AdServerConfig::SiteAcceptBannersManually->name => self::SITE_ACCEPT_BANNERS_MANUALLY,
            AdServerConfig::SiteClassifierLocalBanners->name => self::SITE_CLASSIFIER_LOCAL_BANNERS,
            AdServerConfig::SupplyPlaceholderColor->name => self::SUPPLY_PLACEHOLDER_COLOR,
            AdServerConfig::SupplyPlaceholderFile->name => self::SUPPLY_PLACEHOLDER_FILE,
            AdServerConfig::UploadLimitImage->name => self::UPLOAD_LIMIT_IMAGE,
            AdServerConfig::UploadLimitModel->name => self::UPLOAD_LIMIT_MODEL,
            AdServerConfig::UploadLimitVideo->name => self::UPLOAD_LIMIT_VIDEO,
            AdServerConfig::UploadLimitZip->name => self::UPLOAD_LIMIT_ZIP,
            AdServerConfig::Url->name => self::URL,
            AdServerConfig::WalletAddress->name => self::ADSHARES_ADDRESS,
            AdServerConfig::WalletNodeHost->name => self::ADSHARES_NODE_HOST,
            AdServerConfig::WalletNodePort->name => self::ADSHARES_NODE_PORT,
            AdServerConfig::WalletSecretKey->name => self::ADSHARES_SECRET,
            GeneralConfig::SupportChat->name => self::SUPPORT_CHAT,
            GeneralConfig::SupportEmail->name => self::SUPPORT_EMAIL,
            GeneralConfig::SupportTelegram->name => self::SUPPORT_TELEGRAM,
            GeneralConfig::TechnicalEmail->name => self::TECHNICAL_EMAIL,
            GeneralConfig::SmtpHost->name => self::MAIL_SMTP_HOST,
            GeneralConfig::SmtpPassword->name => self::MAIL_SMTP_PASSWORD,
            GeneralConfig::SmtpPort->name => self::MAIL_SMTP_PORT,
            GeneralConfig::SmtpSender->name => self::MAIL_FROM_NAME,
            GeneralConfig::SmtpUsername->name => self::MAIL_SMTP_USERNAME,
        ];

        $mappedData = [];
        foreach ($data as $key => $value) {
            if (isset($keyMap[$key])) {
                if (is_bool($value)) {
                    $value = $value ? '1' : '0';
                }
                $mappedData[$keyMap[$key]] = null !== $value ? (string)$value : null;
            }
        }

        if (!$mappedData) {
            throw new InvalidArgumentException('No data to store');
        }

        return $mappedData;
    }

    private static function mapPlaceholderDataToAdServerFormat(array $data): array
    {
        $keyMap = [
            AdPanelConfig::PlaceholderIndexDescription->name => self::PLACEHOLDER_INDEX_DESCRIPTION,
            AdPanelConfig::PlaceholderIndexKeywords->name => self::PLACEHOLDER_INDEX_KEYWORDS,
            AdPanelConfig::PlaceholderIndexMetaTags->name => self::PLACEHOLDER_INDEX_META_TAGS,
            AdPanelConfig::PlaceholderIndexTitle->name => self::PLACEHOLDER_INDEX_TITLE,
            AdPanelConfig::PlaceholderLoginInfo->name => self::PLACEHOLDER_LOGIN_INFO,
            AdPanelConfig::PlaceholderRobotsTxt->name => self::PLACEHOLDER_ROBOTS_TXT,
            AdServerConfig::PrivacyPolicy->name => self::PLACEHOLDER_PRIVACY_POLICY,
            AdServerConfig::Terms->name => self::PLACEHOLDER_TERMS,
        ];

        $mappedData = [];
        foreach ($data as $key => $value) {
            if (isset($keyMap[$key])) {
                $mappedData[$keyMap[$key]] = null !== $value ? (string)$value : null;
            }
        }

        if (!$mappedData) {
            throw new InvalidArgumentException('No data to store');
        }

        return $mappedData;
    }

    private function checkStatusCode(ResponseInterface $response): void
    {
        try {
            $statusCode = $response->getStatusCode();
        } catch (TransportExceptionInterface $exception) {
            $this->logger->critical(sprintf('AdServer does not respond: %s', $exception->getMessage()));
            throw new ServiceNotPresent('AdServer does not respond');
        }

        if ($statusCode < Response::HTTP_OK || $statusCode >= Response::HTTP_MULTIPLE_CHOICES) {
            if (Response::HTTP_UNPROCESSABLE_ENTITY === $statusCode) {
                $message = json_decode($response->getContent(false))->message;
                throw new UnexpectedResponseException($message, $statusCode);
            }
            throw new UnexpectedResponseException(
                sprintf('AdServer responded with an invalid code (%d)', $statusCode),
                $statusCode,
            );
        }
    }

    public function setupAdClassify(string $adClassifyUrl, string $apiKeyName, string $apiKeySecret): void
    {
        $this->patchData(
            $this->buildUri(self::RESOURCE_CONFIG),
            [
                self::CLASSIFIER_EXTERNAL_API_KEY_NAME => $apiKeyName,
                self::CLASSIFIER_EXTERNAL_API_KEY_SECRET => $apiKeySecret,
                self::CLASSIFIER_EXTERNAL_BASE_URL => $adClassifyUrl,
            ]
        );
    }

    public function setupAdPanel(string $adPanelUrl): void
    {
        $this->patchData($this->buildUri(self::RESOURCE_CONFIG), [self::ADPANEL_URL => $adPanelUrl]);
    }

    public function setupAdPay(string $adPayUrl): void
    {
        $this->patchData($this->buildUri(self::RESOURCE_CONFIG), [self::ADPAY_URL => $adPayUrl]);
    }

    public function setupAdSelect(string $adSelectUrl): void
    {
        $this->patchData($this->buildUri(self::RESOURCE_CONFIG), [self::ADSELECT_URL => $adSelectUrl]);
    }

    public function setupAdUser(string $adUserUrl, string $adUserInternalUrl): void
    {
        $this->patchData(
            $this->buildUri(self::RESOURCE_CONFIG),
            [
                self::ADUSER_BASE_URL => $adUserUrl,
                self::ADUSER_INTERNAL_URL => $adUserInternalUrl === $adUserUrl ? null : $adUserInternalUrl,
            ]
        );
    }

    private function getData(string $url, InputBag $query = null): mixed
    {
        $response = $this->httpClient->request(
            'GET',
            $url,
            [
                'headers' => $this->getRequestHeaders(),
                'query' => $query?->all() ?? [],
            ]
        );
        $this->checkStatusCode($response);

        return json_decode($response->getContent(), true);
    }

    private function patchData(string $url, array $data): array
    {
        $response = $this->httpClient->request(
            'PATCH',
            $url,
            [
                'headers' => $this->getRequestHeaders(),
                'json' => $data
            ]
        );
        $this->checkStatusCode($response);

        return json_decode($response->getContent(), true);
    }

    private function postData(string $url, array $data): array
    {
        $response = $this->httpClient->request(
            'POST',
            $url,
            [
                'headers' => $this->getRequestHeaders(),
                'json' => $data
            ]
        );
        $this->checkStatusCode($response);

        return json_decode($response->getContent(), true);
    }

    private function deleteData(string $url): void
    {
        $response = $this->httpClient->request(
            'DELETE',
            $url,
            [
                'headers' => $this->getRequestHeaders(),
            ]
        );
        $this->checkStatusCode($response);
    }

    public function fetchCreativePlaceholders(Request $request): array
    {
        return $this->getData($this->buildUri('creatives/placeholder'), $request->query);
    }

    public function uploadCreativePlaceholders(Request $request): array
    {
        $files = $request->files;
        $formFields = [];
        /** @var UploadedFile $file */
        foreach ($files->getIterator() as $key => $file) {
            $formFields[$key] = new DataPart($file->getContent(), $file->getClientOriginalName(), $file->getMimeType());
        }
        $formFields['medium'] = $request->get('medium');
        if (null !== ($vendor = $request->get('vendor'))) {
            $formFields['vendor'] = $vendor;
        }
        $formFields['type'] = $request->get('type');
        $formData = new FormDataPart($formFields);

        $response = $this->httpClient->request(
            'POST',
            $this->buildUri('creatives/placeholder'),
            [
                'headers' => array_merge(
                    $formData->getPreparedHeaders()->toArray(),
                    $this->getRequestHeaders(),
                ),
                'body' => $formData->bodyToIterable(),
            ],
        );
        $this->checkStatusCode($response);

        return json_decode($response->getContent(), true);
    }

    public function deleteCreativePlaceholder(string $uuid): void
    {
        $this->deleteData($this->buildUri(sprintf('creatives/placeholder/%s', $uuid)));
    }

    public function fetchTaxonomyMedia(): array
    {
        return $this->getData($this->buildUri('taxonomy/media'));
    }

    public function fetchTaxonomyMedium(string $medium, ?string $vendor = null)
    {
        $inputBag = new InputBag();
        if (null !== $vendor) {
            $inputBag->set('vendor', $vendor);
        }
        return $this->getData($this->buildUri(sprintf('taxonomy/media/%s', $medium)), $inputBag);
    }

    public function fetchTaxonomyVendors(string $medium): array
    {
        return $this->getData($this->buildUri(sprintf('taxonomy/media/%s/vendors', $medium)));
    }
}
