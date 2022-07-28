<?php

namespace App\Service;

use App\Entity\Configuration;
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
    private const KEY_MAP = [
        Configuration::ADCLASSIFY_URL => self::CLASSIFIER_EXTERNAL_BASE_URL,
        Configuration::ADPAY_URL => self::ADPAY_URL,
        Configuration::ADSELECT_URL => self::ADSELECT_URL,
        Configuration::BASE_ADPANEL_URL => self::ADPANEL_URL,
        Configuration::BASE_ADSERVER_URL => self::URL,
        Configuration::BASE_ADUSER_URL => self::ADUSER_BASE_URL,
        Configuration::BASE_ADUSER_INTERNAL_URL => self::ADUSER_INTERNAL_URL,
        Configuration::BASE_ADSERVER_NAME => self::ADSERVER_NAME,
        Configuration::BASE_SUPPORT_EMAIL => self::SUPPORT_EMAIL,
        Configuration::BASE_TECHNICAL_EMAIL => self::TECHNICAL_EMAIL,
        Configuration::CLASSIFIER_API_KEY_NAME => self::CLASSIFIER_EXTERNAL_API_KEY_NAME,
        Configuration::CLASSIFIER_API_KEY_SECRET => self::CLASSIFIER_EXTERNAL_API_KEY_SECRET,
        Configuration::LICENSE_KEY => self::ADSHARES_LICENSE_KEY,
        Configuration::SMTP_HOST => self::MAIL_SMTP_HOST,
        Configuration::SMTP_PASSWORD => self::MAIL_SMTP_PASSWORD,
        Configuration::SMTP_PORT => self::MAIL_SMTP_PORT,
        Configuration::SMTP_SENDER => self::MAIL_FROM_NAME,
        Configuration::SMTP_USERNAME => self::MAIL_SMTP_USERNAME,
        Configuration::WALLET_ADDRESS => self::ADSHARES_ADDRESS,
        Configuration::WALLET_NODE_HOST => self::ADSHARES_NODE_HOST,
        Configuration::WALLET_NODE_PORT => self::ADSHARES_NODE_PORT,
        Configuration::WALLET_SECRET_KEY => self::ADSHARES_SECRET,
    ];
    private const ADPANEL_URL = 'adpanel-url';
    private const ADPAY_BID_STRATEGY_EXPORT_TIME = 'adpay-bid-strategy-export';
    private const ADPAY_CAMPAIGN_EXPORT_TIME = 'adpay-campaign-export';
    private const ADPAY_LAST_EXPORTED_CONVERSION_TIME = 'adpay-last-conversion-time';
    private const ADPAY_LAST_EXPORTED_EVENT_TIME = 'adpay-last-event-time';
    private const ADPAY_URL = 'adpay-url';
    private const ADS_LOG_START = 'ads-log-start';
    private const ADS_OPERATOR_SERVER_URL = 'ads-operator-server-url';
    private const ADS_RPC_URL = 'ads-rpc-url';
    private const ADSELECT_INVENTORY_EXPORT_TIME = 'adselect-inventory-export';
    private const ADSELECT_URL = 'adselect-url';
    private const ADSERVER_NAME = 'adserver-name';
    private const ADSHARES_ADDRESS = 'adshares-address';
    private const ADSHARES_LICENSE_KEY = 'adshares-license-key';
    private const ADSHARES_LICENSE_SERVER_URL = 'adshares-license-server-url';
    private const ADSHARES_NODE_HOST = 'adshares-node-host';
    private const ADSHARES_NODE_PORT = 'adshares-node-port';
    private const ADSHARES_SECRET = 'adshares-secret';
    private const ADUSER_BASE_URL = 'aduser-base-url';
    private const ADUSER_INFO_URL = 'aduser-info-url';
    private const ADUSER_INTERNAL_URL = 'aduser-internal-url';
    private const ADUSER_SERVE_SUBDOMAIN = 'aduser-serve-subdomain';
    private const ALLOW_ZONE_IN_IFRAME = 'allow_zone-in-iframe';
    private const AUTO_CONFIRMATION_ENABLED = 'auto-confirmation-enabled';
    private const AUTO_REGISTRATION_ENABLED = 'auto-registration-enabled';
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
    private const CLASSIFIER_EXTERNAL_API_KEY_NAME = 'classifier-external-api-key-name';
    private const CLASSIFIER_EXTERNAL_API_KEY_SECRET = 'classifier-external-api-key-secret';
    private const CLASSIFIER_EXTERNAL_BASE_URL = 'classifier-external-base-url';
    private const CLASSIFIER_EXTERNAL_NAME = 'classifier-external-name';
    private const CLASSIFIER_EXTERNAL_PUBLIC_KEY = 'classifier-external-public-key';
    private const COLD_WALLET_ADDRESS = 'cold-wallet-address';
    private const COLD_WALLET_IS_ACTIVE = 'cold-wallet-is-active';
    private const CRM_MAIL_ADDRESS_ON_CAMPAIGN_CREATED = 'crm-mail-address-on-campaign-created';
    private const CRM_MAIL_ADDRESS_ON_SITE_ADDED = 'crm-mail-address-on-site-added';
    private const CRM_MAIL_ADDRESS_ON_USER_REGISTERED = 'crm-mail-address-on-user-registered';
    private const EMAIL_VERIFICATION_REQUIRED = 'email-verification-required';
    private const EXCHANGE_API_KEY = 'exchange-api-key';
    private const EXCHANGE_API_SECRET = 'exchange-api-secret';
    private const EXCHANGE_API_URL = 'exchange-api-url';
    private const EXCHANGE_CURRENCIES = 'exchange-currencies';
    private const FIAT_DEPOSIT_MAX_AMOUNT = 'fiat-deposit-max-amount';
    private const FIAT_DEPOSIT_MIN_AMOUNT = 'fiat-deposit-min-amount';
    private const HOT_WALLET_MAX_VALUE = 'hotwallet-max-value';
    private const HOT_WALLET_MIN_VALUE = 'hotwallet-min-value';
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
    private const MAIL_FROM_NAME = 'mail-from-name';
    private const MAIL_MAILER = 'mail-mailer';
    private const MAIL_SMTP_ENCRYPTION = 'mail-smtp-encryption';
    private const MAIL_SMTP_HOST = 'mail-smtp-host';
    private const MAIL_SMTP_PASSWORD = 'mail-smtp-password';
    private const MAIL_SMTP_PORT = 'mail-smtp-port';
    private const MAIL_SMTP_USERNAME = 'mail-smtp-username';
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
    private const REFERRAL_REFUND_ENABLED = 'referral-refund-enabled';
    private const REFERRAL_REFUND_COMMISSION = 'referral-refund-commission';
    private const REGISTRATION_MODE = 'registration-mode';
    private const OPERATOR_RX_FEE = 'payment-rx-fee';
    private const OPERATOR_TX_FEE = 'payment-tx-fee';
    private const OPERATOR_WALLET_EMAIL_LAST_TIME = 'operator-wallet-transfer-email-time';
    private const SERVE_BASE_URL = 'serve-base-url';
    private const SITE_ACCEPT_BANNERS_MANUALLY = 'site-accept-banners-manually';
    private const SITE_CLASSIFIER_LOCAL_BANNERS = 'site-classifier-local-banners';
    private const SITE_FILTERING_EXCLUDE = 'site-filtering-exclude';
    private const SITE_FILTERING_REQUIRE = 'site-filtering-require';
    private const SITE_VERIFICATION_NOTIFICATION_TIME_THRESHOLD = 'site-verification-time-threshold';
    private const SUPPORT_EMAIL = 'support-email';
    private const SKYNET_API_KEY = 'skynet-api-key';
    private const SKYNET_API_URL = 'skynet-api-url';
    private const SKYNET_CDN_URL = 'skynet-cdn-url';
    private const TECHNICAL_EMAIL = 'technical-email';
    private const UPLOAD_LIMIT_IMAGE = 'upload-limit-image';
    private const UPLOAD_LIMIT_MODEL = 'upload-limit-model';
    private const UPLOAD_LIMIT_VIDEO = 'upload-limit-video';
    private const UPLOAD_LIMIT_ZIP = 'upload-limit-zip';
    private const URL = 'url';

    private HttpClientInterface $httpClient;
    private LoggerInterface $logger;
    private TokenStorageInterface $tokenStorage;
    private string $adserverBaseUri;

    public function __construct(HttpClientInterface $httpClient, LoggerInterface $logger, TokenStorageInterface $tokenStorage, string $adserverBaseUri)
    {
        $this->httpClient = $httpClient;
        $this->logger = $logger;
        $this->tokenStorage = $tokenStorage;
        $this->adserverBaseUri = $adserverBaseUri;
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

        $body = json_decode($response->getContent(), true);

        $data = [];
        foreach (self::KEY_MAP as $localKey => $remoteKey) {
            $data[$localKey] = $body[$remoteKey] ?? null;
        }

        return $data;
    }

    public function store(array $data): void
    {
        $response = $this->httpClient->request(
            'PATCH',
            $this->buildUri(),
            [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->getToken(),
                ],
                'json' => $this->mapDataToAdServerFormat($data)
            ]
        );

        $this->checkStatusCode($response);
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
        $mappedData = [];
        foreach ($data as $key => $value) {
            if (isset(self::KEY_MAP[$key])) {
                if (is_bool($value)) {
                    $value = $value ? '1' : '0';
                }
                $mappedData[self::KEY_MAP[$key]] = (string)$value;
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
}
