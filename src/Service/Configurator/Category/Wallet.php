<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdsCredentialsChecker;
use App\Service\AdServerConfigurationClient;
use App\Utility\Validator\AdsAccountValidator;
use App\ValueObject\AccountId;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class Wallet implements ConfiguratorCategory
{
    private const DEFAULT_NODE_PORT = 6511;
    private const FIELDS = [
        AdServerConfig::WalletAddress,
        AdServerConfig::WalletSecretKey,
    ];
    private const SECRET_KEY_PATTERN = '/^[0-9A-F]{64}$/i';

    public function __construct(
        private readonly AdsCredentialsChecker $adsCredentialsChecker,
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
        private readonly HttpClientInterface $httpClient,
    ) {
    }

    public function process(array $content): void
    {
        $this->validate($content);

        if (!isset($content[AdServerConfig::WalletNodeHost->name])) {
            $accountId = new AccountId($content[AdServerConfig::WalletAddress->name]);
            $content[AdServerConfig::WalletNodeHost->name] = $this->getNodeHostByAccountAddress($accountId);
        }
        $content[AdServerConfig::WalletNodePort->name] =
            (int)($content[AdServerConfig::WalletNodePort->name] ?? self::DEFAULT_NODE_PORT);

        try {
            $this->adsCredentialsChecker->check(
                $content[AdServerConfig::WalletAddress->name],
                $content[AdServerConfig::WalletSecretKey->name],
                $content[AdServerConfig::WalletNodeHost->name],
                $content[AdServerConfig::WalletNodePort->name]
            );
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }

        $data = [
            AdServerConfig::WalletAddress->name => $content[AdServerConfig::WalletAddress->name],
            AdServerConfig::WalletNodeHost->name => $content[AdServerConfig::WalletNodeHost->name],
            AdServerConfig::WalletNodePort->name => $content[AdServerConfig::WalletNodePort->name],
            AdServerConfig::WalletSecretKey->name => $content[AdServerConfig::WalletSecretKey->name],
        ];
        $this->adServerConfigurationClient->store($data);

        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $data);
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field->name])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field->name));
            }
        }
        if (1 !== preg_match(self::SECRET_KEY_PATTERN, $content[AdServerConfig::WalletSecretKey->name])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` must be a hexadecimal string of 64 characters',
                    AdServerConfig::WalletSecretKey->name
                )
            );
        }
        if (!(new AdsAccountValidator())->valid($content[AdServerConfig::WalletAddress->name])) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid ADS account', AdServerConfig::WalletAddress->name)
            );
        }

        if (
            !isset($content[AdServerConfig::WalletNodeHost->name])
            && !isset($content[AdServerConfig::WalletNodePort->name])
        ) {
            return;
        }

        if (!isset($content[AdServerConfig::WalletNodeHost->name])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` is required if field `%s` is present',
                    AdServerConfig::WalletNodeHost->name,
                    AdServerConfig::WalletNodePort->name
                )
            );
        }
        if (!isset($content[AdServerConfig::WalletNodePort->name])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` is required if field `%s` is present',
                    AdServerConfig::WalletNodePort->name,
                    AdServerConfig::WalletNodeHost->name
                )
            );
        }

        if (
            !filter_var($content[AdServerConfig::WalletNodeHost->name], FILTER_VALIDATE_DOMAIN)
            && !filter_var($content[AdServerConfig::WalletNodeHost->name], FILTER_VALIDATE_IP)
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a host', AdServerConfig::WalletNodeHost->name)
            );
        }
        if (false === filter_var($content[AdServerConfig::WalletNodePort->name], FILTER_VALIDATE_INT)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an integer', AdServerConfig::WalletNodePort->name)
            );
        }
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
