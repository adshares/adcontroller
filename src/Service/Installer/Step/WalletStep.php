<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdsCredentialsChecker;
use App\Service\AdServerConfigurationClient;
use App\ValueObject\AccountId;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WalletStep implements InstallerStep
{
    private const DEFAULT_NODE_PORT = 6511;
    private const FIELDS = [
        Configuration::WALLET_ADDRESS,
        Configuration::WALLET_SECRET_KEY,
    ];
    private const SECRET_KEY_PATTERN = '/^[0-9A-F]{64}$/i';

    private AdsCredentialsChecker $adsCredentialsChecker;
    private AdServerConfigurationClient $adServerConfigurationClient;
    private ConfigurationRepository $repository;
    private HttpClientInterface $httpClient;

    public function __construct(
        AdsCredentialsChecker $adsCredentialsChecker,
        AdServerConfigurationClient $adServerConfigurationClient,
        ConfigurationRepository $repository,
        HttpClientInterface $httpClient
    ) {
        $this->adsCredentialsChecker = $adsCredentialsChecker;
        $this->adServerConfigurationClient = $adServerConfigurationClient;
        $this->repository = $repository;
        $this->httpClient = $httpClient;
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $this->getName());
            return;
        }

        $this->validate($content);

        if (!isset($content[Configuration::WALLET_NODE_HOST])) {
            $accountId = new AccountId($content[Configuration::WALLET_ADDRESS]);
            $content[Configuration::WALLET_NODE_HOST] = $this->getNodeHostByAccountAddress($accountId);
        }
        $content[Configuration::WALLET_NODE_PORT] =
            (int)($content[Configuration::WALLET_NODE_PORT] ?? self::DEFAULT_NODE_PORT);

        try {
            $this->adsCredentialsChecker->check(
                $content[Configuration::WALLET_ADDRESS],
                $content[Configuration::WALLET_SECRET_KEY],
                $content[Configuration::WALLET_NODE_HOST],
                $content[Configuration::WALLET_NODE_PORT]
            );
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }

        $data = [
            Configuration::WALLET_ADDRESS => $content[Configuration::WALLET_ADDRESS],
            Configuration::WALLET_NODE_HOST => $content[Configuration::WALLET_NODE_HOST],
            Configuration::WALLET_NODE_PORT => $content[Configuration::WALLET_NODE_PORT],
            Configuration::WALLET_SECRET_KEY => $content[Configuration::WALLET_SECRET_KEY],
        ];
        $this->adServerConfigurationClient->store($data);

        $data[Configuration::INSTALLER_STEP] = $this->getName();
        $this->repository->insertOrUpdate($data);
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }
        if (1 !== preg_match(self::SECRET_KEY_PATTERN, $content[Configuration::WALLET_SECRET_KEY])) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a hexadecimal string of 64 characters', Configuration::WALLET_SECRET_KEY)
            );
        }
        if (
            !is_string($content[Configuration::WALLET_ADDRESS]) ||
            !AccountId::isValid($content[Configuration::WALLET_ADDRESS])
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid ADS account', Configuration::WALLET_ADDRESS)
            );
        }

        if (
            !isset($content[Configuration::WALLET_NODE_HOST])
            && !isset($content[Configuration::WALLET_NODE_PORT])
        ) {
            return;
        }

        if (!isset($content[Configuration::WALLET_NODE_HOST])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` is required if field `%s` is present',
                    Configuration::WALLET_NODE_HOST,
                    Configuration::WALLET_NODE_PORT
                )
            );
        }
        if (!isset($content[Configuration::WALLET_NODE_PORT])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` is required if field `%s` is present',
                    Configuration::WALLET_NODE_PORT,
                    Configuration::WALLET_NODE_HOST
                )
            );
        }

        if (
            !filter_var($content[Configuration::WALLET_NODE_HOST], FILTER_VALIDATE_DOMAIN)
            && !filter_var($content[Configuration::WALLET_NODE_HOST], FILTER_VALIDATE_IP)
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a host', Configuration::WALLET_NODE_HOST)
            );
        }
        if (!filter_var($content[Configuration::WALLET_NODE_PORT], FILTER_VALIDATE_INT)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an integer', Configuration::WALLET_NODE_PORT)
            );
        }
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_WALLET;
    }

    public function fetchData(): array
    {
        if ($this->isDataRequired()) {
            return [
                Configuration::COMMON_DATA_REQUIRED => true,
            ];
        }

        $configuration = $this->adServerConfigurationClient->fetch();

        return [
            Configuration::COMMON_DATA_REQUIRED => false,
            Configuration::WALLET_ADDRESS => $configuration[Configuration::WALLET_ADDRESS],
            Configuration::WALLET_NODE_HOST => $configuration[Configuration::WALLET_NODE_HOST],
            Configuration::WALLET_NODE_PORT => $configuration[Configuration::WALLET_NODE_PORT],
        ];
    }

    public function isDataRequired(): bool
    {
        $requiredKeys = [
            Configuration::WALLET_ADDRESS,
            Configuration::WALLET_SECRET_KEY,
            Configuration::WALLET_NODE_HOST,
            Configuration::WALLET_NODE_PORT,
        ];
        $localConfiguration = $this->repository->fetchValuesByNames($requiredKeys);

        foreach ($requiredKeys as $requiredKey) {
            if (!isset($localConfiguration[$requiredKey])) {
                return true;
            }
        }

        $remoteConfiguration = $this->adServerConfigurationClient->fetch();
        $requiredKeys = [
            Configuration::WALLET_ADDRESS,
            Configuration::WALLET_NODE_HOST,
            Configuration::WALLET_NODE_PORT,
        ];

        foreach ($requiredKeys as $requiredKey) {
            if (
                !isset($remoteConfiguration[$requiredKey])
                || $remoteConfiguration[$requiredKey] !== $localConfiguration[$requiredKey]
            ) {
                return true;
            }
        }

        try {
            $this->adsCredentialsChecker->check(
                $localConfiguration[Configuration::WALLET_ADDRESS],
                $localConfiguration[Configuration::WALLET_SECRET_KEY],
                $localConfiguration[Configuration::WALLET_NODE_HOST],
                $localConfiguration[Configuration::WALLET_NODE_PORT]
            );
        } catch (UnexpectedResponseException) {
            return true;
        }

        return false;
    }

    public function getNodeHostByAccountAddress(AccountId $accountId): string
    {
        $nodeId = $accountId->getNodeId();

        if ($this->isNodeSupportedByAdshares($nodeId)) {
            return $this->getAdsharesNodeHostById($nodeId);
        }

        $response = $this->httpClient->request(
            'POST',
            'https://rpc.adshares.net',
            [
                'json' => [
                    'id' => 2,
                    'jsonrpc' => '2.0',
                    'method' => 'get_block',
                ]
            ]
        );

        $nodes = json_decode($response->getContent(), true)['result']['block']['nodes'];
        foreach ($nodes as $node) {
            if ($nodeId === $node['id']) {
                return $node['ipv4'];
            }
        }

        return throw new UnprocessableEntityHttpException(sprintf('Node (%s) does not exist', $nodeId));
    }

    private function isNodeSupportedByAdshares(string $nodeId): bool
    {
        $lastNodeSupportedByAdshares = 34;
        $decimalNodeId = hexdec($nodeId);

        return $decimalNodeId > 0 && $decimalNodeId <= $lastNodeSupportedByAdshares;
    }

    private function getAdsharesNodeHostById(string $nodeId): string
    {
        return sprintf('n%s.e11.click', substr($nodeId, 2, 2));
    }
}
