<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdsCredentialsChecker;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;
use App\Utility\Validator\AdsAccountValidator;
use App\ValueObject\AccountId;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class Wallet implements ConfiguratorCategory
{
    private const DEFAULT_NODE_PORT = 6511;
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
        $fields = self::fields();
        $input = ArrayUtils::filterByKeys($content, $fields);
        if (empty($input)) {
            throw new UnprocessableEntityHttpException('Data is required');
        }

        $this->validate($input);

        if (!isset($input[AdServerConfig::WalletNodeHost->name])) {
            $accountId = new AccountId($input[AdServerConfig::WalletAddress->name]);
            $input[AdServerConfig::WalletNodeHost->name] = $this->getNodeHostByAccountAddress($accountId);
        }
        $input[AdServerConfig::WalletNodePort->name] =
            (int)($input[AdServerConfig::WalletNodePort->name] ?? self::DEFAULT_NODE_PORT);

        try {
            $this->adsCredentialsChecker->check(
                $input[AdServerConfig::WalletAddress->name],
                $input[AdServerConfig::WalletSecretKey->name],
                $input[AdServerConfig::WalletNodeHost->name],
                $input[AdServerConfig::WalletNodePort->name]
            );
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }

        $this->adServerConfigurationClient->store($input);
        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $input);
    }

    private function validate(array $input): void
    {
        foreach (
            [
                AdServerConfig::WalletAddress->name,
                AdServerConfig::WalletSecretKey->name
            ] as $field
        ) {
            if (!isset($input[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }

        if (1 !== preg_match(self::SECRET_KEY_PATTERN, $input[AdServerConfig::WalletSecretKey->name])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` must be a hexadecimal string of 64 characters',
                    AdServerConfig::WalletSecretKey->name
                )
            );
        }
        if (!(new AdsAccountValidator())->valid($input[AdServerConfig::WalletAddress->name])) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid ADS account', AdServerConfig::WalletAddress->name)
            );
        }

        if (
            !isset($input[AdServerConfig::WalletNodeHost->name])
            && !isset($input[AdServerConfig::WalletNodePort->name])
        ) {
            return;
        }

        if (!isset($input[AdServerConfig::WalletNodeHost->name])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` is required if field `%s` is present',
                    AdServerConfig::WalletNodeHost->name,
                    AdServerConfig::WalletNodePort->name
                )
            );
        }
        if (!isset($input[AdServerConfig::WalletNodePort->name])) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` is required if field `%s` is present',
                    AdServerConfig::WalletNodePort->name,
                    AdServerConfig::WalletNodeHost->name
                )
            );
        }

        if (
            !filter_var($input[AdServerConfig::WalletNodeHost->name], FILTER_VALIDATE_DOMAIN)
            && !filter_var($input[AdServerConfig::WalletNodeHost->name], FILTER_VALIDATE_IP)
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a host', AdServerConfig::WalletNodeHost->name)
            );
        }
        if (false === filter_var($input[AdServerConfig::WalletNodePort->name], FILTER_VALIDATE_INT)) {
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

    private static function fields(): array
    {
        return [
            AdServerConfig::WalletAddress->name,
            AdServerConfig::WalletSecretKey->name,
            AdServerConfig::WalletNodeHost->name,
            AdServerConfig::WalletNodePort->name,
        ];
    }
}
