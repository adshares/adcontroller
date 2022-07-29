<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdServer;
use App\Entity\Enum\App;
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
        AdServer::WALLET_ADDRESS,
        AdServer::WALLET_SECRET_KEY,
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
            $this->repository->insertOrUpdateOne(App::INSTALLER_STEP, $this->getName());
            return;
        }

        $this->validate($content);

        if (!isset($content[AdServer::WALLET_NODE_HOST->value])) {
            $accountId = new AccountId($content[AdServer::WALLET_ADDRESS->value]);
            $content[AdServer::WALLET_NODE_HOST->value] = $this->getNodeHostByAccountAddress($accountId);
        }
        $content[AdServer::WALLET_NODE_PORT->value] =
            (int)($content[AdServer::WALLET_NODE_PORT->value] ?? self::DEFAULT_NODE_PORT);

        try {
            $this->adsCredentialsChecker->check(
                $content[AdServer::WALLET_ADDRESS->value],
                $content[AdServer::WALLET_SECRET_KEY->value],
                $content[AdServer::WALLET_NODE_HOST->value],
                $content[AdServer::WALLET_NODE_PORT->value]
            );
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }

        $data = [
            AdServer::WALLET_ADDRESS->value => $content[AdServer::WALLET_ADDRESS->value],
            AdServer::WALLET_NODE_HOST->value => $content[AdServer::WALLET_NODE_HOST->value],
            AdServer::WALLET_NODE_PORT->value => $content[AdServer::WALLET_NODE_PORT->value],
            AdServer::WALLET_SECRET_KEY->value => $content[AdServer::WALLET_SECRET_KEY->value],
        ];
        $this->adServerConfigurationClient->store($data);

        $this->repository->insertOrUpdate(AdServer::MODULE, $data);
        $this->repository->insertOrUpdateOne(App::INSTALLER_STEP, $this->getName());
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field->value])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field->value));
            }
        }
        if (1 !== preg_match(self::SECRET_KEY_PATTERN, $content[AdServer::WALLET_SECRET_KEY->value])) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a hexadecimal string of 64 characters', AdServer::WALLET_SECRET_KEY->value)
            );
        }
        if (
            !is_string($content[AdServer::WALLET_ADDRESS->value]) ||
            !AccountId::isValid($content[AdServer::WALLET_ADDRESS->value])
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid ADS account', AdServer::WALLET_ADDRESS->value)
            );
        }

        if (
            !isset($content[AdServer::WALLET_NODE_HOST->value])
            && !isset($content[AdServer::WALLET_NODE_PORT->value])
        ) {
            return;
        }

        if (!isset($content[AdServer::WALLET_NODE_HOST->value])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` is required if field `%s` is present',
                    AdServer::WALLET_NODE_HOST->value,
                    AdServer::WALLET_NODE_PORT->value
                )
            );
        }
        if (!isset($content[AdServer::WALLET_NODE_PORT->value])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` is required if field `%s` is present',
                    AdServer::WALLET_NODE_PORT->value,
                    AdServer::WALLET_NODE_HOST->value
                )
            );
        }

        if (
            !filter_var($content[AdServer::WALLET_NODE_HOST->value], FILTER_VALIDATE_DOMAIN)
            && !filter_var($content[AdServer::WALLET_NODE_HOST->value], FILTER_VALIDATE_IP)
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a host', AdServer::WALLET_NODE_HOST->value)
            );
        }
        if (!filter_var($content[AdServer::WALLET_NODE_PORT->value], FILTER_VALIDATE_INT)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an integer', AdServer::WALLET_NODE_PORT->value)
            );
        }
    }

    public function getName(): string
    {
        return InstallerStepEnum::WALLET->value;
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
        $enums = [
            AdServer::WALLET_ADDRESS,
            AdServer::WALLET_NODE_HOST,
            AdServer::WALLET_NODE_PORT,
            AdServer::WALLET_SECRET_KEY,
        ];
        $module = $enums[0]->getModule();
        $requiredKeys = array_map(fn($enum) => $enum->value, $enums);
        $localConfiguration = $this->repository->fetchValuesByNames($module, $requiredKeys);

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
