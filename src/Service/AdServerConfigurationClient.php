<?php

namespace App\Service;

use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\GeneralConfig;
use App\Exception\ServiceNotPresent;
use App\Exception\UnexpectedResponseException;
use InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class AdServerConfigurationClient
{
    public const ADPANEL_URL = 'adpanel-url';
    private const ADPAY_BID_STRATEGY_EXPORT_TIME = 'adpay-bid-strategy-export';
    private const ADPAY_CAMPAIGN_EXPORT_TIME = 'adpay-campaign-export';
    private const ADPAY_LAST_EXPORTED_CONVERSION_TIME = 'adpay-last-conversion-time';
    private const ADPAY_LAST_EXPORTED_EVENT_TIME = 'adpay-last-event-time';
    public const ADPAY_URL = 'adpay-url';
    private const ADS_LOG_START = 'ads-log-start';
    private const ADS_OPERATOR_SERVER_URL = 'ads-operator-server-url';
    private const ADS_RPC_URL = 'ads-rpc-url';
    private const ADSELECT_INVENTORY_EXPORT_TIME = 'adselect-inventory-export';
    public const ADSELECT_URL = 'adselect-url';
    public const ADSERVER_NAME = 'adserver-name';
    public const ADSHARES_ADDRESS = 'adshares-address';
    public const ADSHARES_LICENSE_KEY = 'adshares-license-key';
    private const ADSHARES_LICENSE_SERVER_URL = 'adshares-license-server-url';
    public const ADSHARES_NODE_HOST = 'adshares-node-host';
    public const ADSHARES_NODE_PORT = 'adshares-node-port';
    public const ADSHARES_SECRET = 'adshares-secret';
    public const ADUSER_BASE_URL = 'aduser-base-url';
    private const ADUSER_INFO_URL = 'aduser-info-url';
    public const ADUSER_INTERNAL_URL = 'aduser-internal-url';
    private const ADUSER_SERVE_SUBDOMAIN = 'aduser-serve-subdomain';
    private const ADVERTISER_APPLY_FORM_URL = 'advertiser-apply-form-url';
    private const ALLOW_ZONE_IN_IFRAME = 'allow_zone-in-iframe';
    public const AUTO_CONFIRMATION_ENABLED = 'auto-confirmation-enabled';
    public const AUTO_REGISTRATION_ENABLED = 'auto-registration-enabled';
    private const AUTO_WITHDRAWAL_LIMIT_ADS = 'auto-withdrawal-limit-ads';
    private const AUTO_WITHDRAWAL_LIMIT_BSC = 'auto-withdrawal-limit-bsc';
    private const AUTO_WITHDRAWAL_LIMIT_BTC = 'auto-withdrawal-limit-btc';
    private const AUTO_WITHDRAWAL_LIMIT_ETH = 'auto-withdrawal-limit-eth';
    private const BANNER_FORCE_HTTPS = 'banner-force-https';
    private const BTC_WITHDRAW = 'btc-withdraw';
    private const BTC_WITHDRAW_FEE = 'btc-withdraw-fee';
    private const BTC_WITHDRAW_MAX_AMOUNT = 'btc-withdraw-max-amount';
    private const BTC_WITHDRAW_MIN_AMOUNT = 'btc-withdraw-min-amount';
    private const CAMPAIGN_MIN_BUDGET = 'campaign-min-budget';
    private const CAMPAIGN_MIN_CPA = 'campaign-min-cpa';
    private const CAMPAIGN_MIN_CPM = 'campaign-min-cpm';
    private const CAMPAIGN_TARGETING_EXCLUDE = 'campaign-targeting-exclude';
    private const CAMPAIGN_TARGETING_REQUIRE = 'campaign-targeting-require';
    private const CDN_PROVIDER = 'cdn-provider';
    private const CHECK_ZONE_DOMAIN = 'check-zone-domain';
    public const CLASSIFIER_EXTERNAL_API_KEY_NAME = 'classifier-external-api-key-name';
    public const CLASSIFIER_EXTERNAL_API_KEY_SECRET = 'classifier-external-api-key-secret';
    public const CLASSIFIER_EXTERNAL_BASE_URL = 'classifier-external-base-url';
    private const CLASSIFIER_EXTERNAL_NAME = 'classifier-external-name';
    private const CLASSIFIER_EXTERNAL_PUBLIC_KEY = 'classifier-external-public-key';
    public const COLD_WALLET_ADDRESS = 'cold-wallet-address';
    public const COLD_WALLET_IS_ACTIVE = 'cold-wallet-is-active';
    private const CRM_MAIL_ADDRESS_ON_CAMPAIGN_CREATED = 'crm-mail-address-on-campaign-created';
    private const CRM_MAIL_ADDRESS_ON_SITE_ADDED = 'crm-mail-address-on-site-added';
    private const CRM_MAIL_ADDRESS_ON_USER_REGISTERED = 'crm-mail-address-on-user-registered';
    private const CURRENCY = 'currency';
    private const DISPLAY_CURRENCY = 'display-currency';
    public const EMAIL_VERIFICATION_REQUIRED = 'email-verification-required';
    private const EXCHANGE_API_KEY = 'exchange-api-key';
    private const EXCHANGE_API_SECRET = 'exchange-api-secret';
    private const EXCHANGE_API_URL = 'exchange-api-url';
    private const EXCHANGE_CURRENCIES = 'exchange-currencies';
    private const FIAT_DEPOSIT_MAX_AMOUNT = 'fiat-deposit-max-amount';
    private const FIAT_DEPOSIT_MIN_AMOUNT = 'fiat-deposit-min-amount';
    public const HOT_WALLET_MAX_VALUE = 'hotwallet-max-value';
    public const HOT_WALLET_MIN_VALUE = 'hotwallet-min-value';
    private const INVENTORY_EXPORT_WHITELIST = 'inventory-export-whitelist';
    private const INVENTORY_IMPORT_WHITELIST = 'inventory-import-whitelist';
    private const INVENTORY_WHITELIST = 'inventory-whitelist';
    private const INVOICE_CURRENCIES = 'invoice-currencies';
    private const INVOICE_COMPANY_ADDRESS = 'invoice-company-address';
    private const INVOICE_COMPANY_BANK_ACCOUNTS = 'invoice-company-bank-accounts';
    private const INVOICE_COMPANY_CITY = 'invoice-company-city';
    private const INVOICE_COMPANY_COUNTRY = 'invoice-company-country';
    private const INVOICE_COMPANY_NAME = 'invoice-company-name';
    private const INVOICE_COMPANY_POSTAL_CODE = 'invoice-company-postal-code';
    private const INVOICE_COMPANY_VAT_ID = 'invoice-company-vat-id';
    private const INVOICE_ENABLED = 'invoice-enabled';
    private const INVOICE_NUMBER_FORMAT = 'invoice-number-format';
    private const LAST_UPDATED_IMPRESSION_ID = 'last-updated-impression-id';
    private const MAIL_FROM_ADDRESS = 'mail-from-address';
    public const MAIL_FROM_NAME = 'mail-from-name';
    private const MAIL_MAILER = 'mail-mailer';
    private const MAIL_SMTP_ENCRYPTION = 'mail-smtp-encryption';
    public const MAIL_SMTP_HOST = 'mail-smtp-host';
    public const MAIL_SMTP_PASSWORD = 'mail-smtp-password';
    public const MAIL_SMTP_PORT = 'mail-smtp-port';
    public const MAIL_SMTP_USERNAME = 'mail-smtp-username';
    private const MAIN_JS_BASE_URL = 'main-js-base-url';
    private const MAIN_JS_TLD = 'main-js-tld';
    private const MAX_PAGE_ZONES = 'max-page-zones';
    private const NETWORK_DATA_CACHE_TTL = 'network_data_cache-ttl';
    private const NOW_PAYMENTS_API_KEY = 'now-payments-api-key';
    private const NOW_PAYMENTS_CURRENCY = 'now-payments-currency';
    private const NOW_PAYMENTS_EXCHANGE = 'now-payments-exchange';
    private const NOW_PAYMENTS_FEE = 'now-payments-fee';
    private const NOW_PAYMENTS_IPN_SECRET = 'now-payments-ipn-secret';
    private const NOW_PAYMENTS_MAX_AMOUNT = 'now-payments-max-amount';
    private const NOW_PAYMENTS_MIN_AMOUNT = 'now-payments-min-amount';
    private const PANEL_PLACEHOLDER_NOTIFICATION_TIME = 'panel-placeholder-notification-time';
    private const PANEL_PLACEHOLDER_UPDATE_TIME = 'panel-placeholder-update-time';
    private const PUBLISHER_APPLY_FORM_URL = 'publisher-apply-form-url';
    public const REFERRAL_REFUND_COMMISSION = 'referral-refund-commission';
    public const REFERRAL_REFUND_ENABLED = 'referral-refund-enabled';
    public const REGISTRATION_MODE = 'registration-mode';
    private const REGISTRATION_USER_TYPES = 'registration-user-types';
    public const OPERATOR_RX_FEE = 'payment-rx-fee';
    public const OPERATOR_TX_FEE = 'payment-tx-fee';
    private const OPERATOR_WALLET_EMAIL_LAST_TIME = 'operator-wallet-transfer-email-time';
    private const SERVE_BASE_URL = 'serve-base-url';
    private const SITE_ACCEPT_BANNERS_MANUALLY = 'site-accept-banners-manually';
    private const SITE_CLASSIFIER_LOCAL_BANNERS = 'site-classifier-local-banners';
    private const SITE_FILTERING_EXCLUDE = 'site-filtering-exclude';
    private const SITE_FILTERING_REQUIRE = 'site-filtering-require';
    private const SITE_VERIFICATION_NOTIFICATION_TIME_THRESHOLD = 'site-verification-time-threshold';
    private const SUPPORT_CHAT = 'support-chat';
    public const SUPPORT_EMAIL = 'support-email';
    private const SUPPORT_TELEGRAM = 'support-telegram';
    private const SKYNET_API_KEY = 'skynet-api-key';
    private const SKYNET_API_URL = 'skynet-api-url';
    private const SKYNET_CDN_URL = 'skynet-cdn-url';
    public const TECHNICAL_EMAIL = 'technical-email';
    private const UPLOAD_LIMIT_IMAGE = 'upload-limit-image';
    private const UPLOAD_LIMIT_MODEL = 'upload-limit-model';
    private const UPLOAD_LIMIT_VIDEO = 'upload-limit-video';
    private const UPLOAD_LIMIT_ZIP = 'upload-limit-zip';
    public const URL = 'url';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly string $adserverBaseUri
    ) {
    }

    public function fetch(): array
    {
        $response = $this->httpClient->request(
            'GET',
            $this->buildUri(),
            [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->getToken(),
                ],
            ]
        );

        $this->checkStatusCode($response);

        return json_decode($response->getContent(), true);
    }

    public function store(array $data): void
    {
        $mapped = $this->mapDataToAdServerFormat($data);
        $this->sendData($mapped);
    }

    private function buildUri(): string
    {
        return sprintf('%s/api/config', $this->adserverBaseUri);
    }

    private function getToken(): string
    {
        return $this->tokenStorage->getToken()->getCredentials();
    }

    private function mapDataToAdServerFormat(array $data): array
    {
        $keyMap = [
            AdServerConfig::AutoConfirmationEnabled->name => self::AUTO_CONFIRMATION_ENABLED,
            AdServerConfig::AutoRegistrationEnabled->name => self::AUTO_REGISTRATION_ENABLED,
            AdServerConfig::ColdWalletAddress->name => self::COLD_WALLET_ADDRESS,
            AdServerConfig::ColdWalletIsActive->name => self::COLD_WALLET_IS_ACTIVE,
            AdServerConfig::EmailVerificationRequired->name => self::EMAIL_VERIFICATION_REQUIRED,
            AdServerConfig::HotWalletMaxValue->name => self::HOT_WALLET_MAX_VALUE,
            AdServerConfig::HotWalletMinValue->name => self::HOT_WALLET_MIN_VALUE,
            AdServerConfig::LicenseKey->name => self::ADSHARES_LICENSE_KEY,
            AdServerConfig::Name->name => self::ADSERVER_NAME,
            AdServerConfig::OperatorRxFee->name => self::OPERATOR_RX_FEE,
            AdServerConfig::OperatorTxFee->name => self::OPERATOR_TX_FEE,
            AdServerConfig::ReferralRefundCommission->name => self::REFERRAL_REFUND_COMMISSION,
            AdServerConfig::ReferralRefundEnabled->name => self::REFERRAL_REFUND_ENABLED,
            AdServerConfig::RegistrationMode->name => self::REGISTRATION_MODE,
            AdServerConfig::Url->name => self::URL,
            AdServerConfig::WalletAddress->name => self::ADSHARES_ADDRESS,
            AdServerConfig::WalletNodeHost->name => self::ADSHARES_NODE_HOST,
            AdServerConfig::WalletNodePort->name => self::ADSHARES_NODE_PORT,
            AdServerConfig::WalletSecretKey->name => self::ADSHARES_SECRET,
            GeneralConfig::SupportEmail->name => self::SUPPORT_EMAIL,
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
                $mappedData[$keyMap[$key]] = (string)$value;
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

        if (Response::HTTP_OK !== $statusCode) {
            if (Response::HTTP_UNPROCESSABLE_ENTITY === $statusCode) {
                $message = json_decode($response->getContent(false))->message;
                throw new UnexpectedResponseException($message);
            }
            throw new UnexpectedResponseException(
                sprintf('AdServer responded with an invalid code (%d)', $statusCode)
            );
        }
    }

    public function setupAdClassify(string $adClassifyUrl, string $apiKeyName, string $apiKeySecret): void
    {
        $this->sendData(
            [
                self::CLASSIFIER_EXTERNAL_API_KEY_NAME => $apiKeyName,
                self::CLASSIFIER_EXTERNAL_API_KEY_SECRET => $apiKeySecret,
                self::CLASSIFIER_EXTERNAL_BASE_URL => $adClassifyUrl,
            ]
        );
    }

    public function setupAdPanel(string $adPanelUrl): void
    {
        $this->sendData([self::ADPANEL_URL => $adPanelUrl]);
    }

    public function setupAdPay(string $adPayUrl): void
    {
        $this->sendData([self::ADPAY_URL => $adPayUrl]);
    }

    public function setupAdSelect(string $adSelectUrl): void
    {
        $this->sendData([self::ADSELECT_URL => $adSelectUrl]);
    }

    public function setupAdUser(string $adUserUrl, string $adUserInternalUrl): void
    {
        $this->sendData(
            [
                self::ADUSER_BASE_URL => $adUserUrl,
                self::ADUSER_INTERNAL_URL => $adUserInternalUrl,
            ]
        );
    }

    private function sendData(array $data): void
    {
        $response = $this->httpClient->request(
            'PATCH',
            $this->buildUri(),
            [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->getToken(),
                ],
                'json' => $data
            ]
        );

        $this->checkStatusCode($response);
    }
}
