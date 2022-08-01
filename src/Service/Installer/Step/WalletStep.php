<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\InstallerStepEnum;
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
        AdServerConfig::WALLET_ADDRESS,
        AdServerConfig::WALLET_SECRET_KEY,
    ];
    private const SECRET_KEY_PATTERN = '/^[0-9A-F]{64}$/i';

    public function __construct(
        private readonly AdsCredentialsChecker $adsCredentialsChecker,
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
        private readonly HttpClientInterface $httpClient
    ) {
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(AppConfig::INSTALLER_STEP, $this->getName());
            return;
        }

        $this->validate($content);

        if (!isset($content[AdServerConfig::WALLET_NODE_HOST->value])) {
            $accountId = new AccountId($content[AdServerConfig::WALLET_ADDRESS->value]);
            $content[AdServerConfig::WALLET_NODE_HOST->value] = $this->getNodeHostByAccountAddress($accountId);
        }
        $content[AdServerConfig::WALLET_NODE_PORT->value] =
            (int)($content[AdServerConfig::WALLET_NODE_PORT->value] ?? self::DEFAULT_NODE_PORT);

        try {
            $this->adsCredentialsChecker->check(
                $content[AdServerConfig::WALLET_ADDRESS->value],
                $content[AdServerConfig::WALLET_SECRET_KEY->value],
                $content[AdServerConfig::WALLET_NODE_HOST->value],
                $content[AdServerConfig::WALLET_NODE_PORT->value]
            );
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }

        $data = [
            AdServerConfig::WALLET_ADDRESS->value => $content[AdServerConfig::WALLET_ADDRESS->value],
            AdServerConfig::WALLET_NODE_HOST->value => $content[AdServerConfig::WALLET_NODE_HOST->value],
            AdServerConfig::WALLET_NODE_PORT->value => $content[AdServerConfig::WALLET_NODE_PORT->value],
            AdServerConfig::WALLET_SECRET_KEY->value => $content[AdServerConfig::WALLET_SECRET_KEY->value],
        ];
        $this->adServerConfigurationClient->store($data);

        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $data);
        $this->repository->insertOrUpdateOne(AppConfig::INSTALLER_STEP, $this->getName());
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field->value])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field->value));
            }
        }
        if (1 !== preg_match(self::SECRET_KEY_PATTERN, $content[AdServerConfig::WALLET_SECRET_KEY->value])) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a hexadecimal string of 64 characters', AdServerConfig::WALLET_SECRET_KEY->value)
            );
        }
        if (
            !is_string($content[AdServerConfig::WALLET_ADDRESS->value]) ||
            !AccountId::isValid($content[AdServerConfig::WALLET_ADDRESS->value])
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid ADS account', AdServerConfig::WALLET_ADDRESS->value)
            );
        }

        if (
            !isset($content[AdServerConfig::WALLET_NODE_HOST->value])
            && !isset($content[AdServerConfig::WALLET_NODE_PORT->value])
        ) {
            return;
        }

        if (!isset($content[AdServerConfig::WALLET_NODE_HOST->value])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` is required if field `%s` is present',
                    AdServerConfig::WALLET_NODE_HOST->value,
                    AdServerConfig::WALLET_NODE_PORT->value
                )
            );
        }
        if (!isset($content[AdServerConfig::WALLET_NODE_PORT->value])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` is required if field `%s` is present',
                    AdServerConfig::WALLET_NODE_PORT->value,
                    AdServerConfig::WALLET_NODE_HOST->value
                )
            );
        }

        if (
            !filter_var($content[AdServerConfig::WALLET_NODE_HOST->value], FILTER_VALIDATE_DOMAIN)
            && !filter_var($content[AdServerConfig::WALLET_NODE_HOST->value], FILTER_VALIDATE_IP)
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a host', AdServerConfig::WALLET_NODE_HOST->value)
            );
        }
        if (!filter_var($content[AdServerConfig::WALLET_NODE_PORT->value], FILTER_VALIDATE_INT)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an integer', AdServerConfig::WALLET_NODE_PORT->value)
            );
        }
    }

    public function getName(): string
    {
        return InstallerStepEnum::Wallet->name;
    }

    public function fetchData(): array
    {
        if ($this->isDataRequired()) {
            return [
                Configuration::COMMON_DATA_REQUIRED => true,
            ];
        }

        $configuration = $this->repository->fetchValuesByNames(
            AdServerConfig::MODULE,
            [
                AdServerConfig::WALLET_ADDRESS->value,
                AdServerConfig::WALLET_NODE_HOST->value,
                AdServerConfig::WALLET_NODE_PORT->value,
            ]
        );
        $configuration[Configuration::COMMON_DATA_REQUIRED] = false;

        return $configuration;
    }

    public function isDataRequired(): bool
    {
        $requiredKeys = [
            AdServerConfig::WALLET_ADDRESS->value,
            AdServerConfig::WALLET_NODE_HOST->value,
            AdServerConfig::WALLET_NODE_PORT->value,
            AdServerConfig::WALLET_SECRET_KEY->value,
        ];
        $configuration = $this->repository->fetchValuesByNames(AdServerConfig::MODULE, $requiredKeys);

        foreach ($requiredKeys as $requiredKey) {
            if (!isset($configuration[$requiredKey])) {
                return true;
            }
        }

        try {
            $this->adsCredentialsChecker->check(
                $configuration[AdServerConfig::WALLET_ADDRESS->value],
                $configuration[AdServerConfig::WALLET_SECRET_KEY->value],
                $configuration[AdServerConfig::WALLET_NODE_HOST->value],
                $configuration[AdServerConfig::WALLET_NODE_PORT->value]
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
