<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdsCredentialsChecker;
use App\Service\EnvEditor;
use App\Service\ServicePresenceChecker;
use App\ValueObject\AccountId;
use App\ValueObject\Module;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WalletStep implements InstallerStep
{
    private const FIELDS = [
        Configuration::WALLET_ADDRESS,
        Configuration::WALLET_SECRET_KEY,
    ];
    private const SECRET_KEY_PATTERN = '/^[0-9A-F]{64}$/i';

    private AdsCredentialsChecker $adsCredentialsChecker;
    private ConfigurationRepository $repository;
    private HttpClientInterface $httpClient;
    private ServicePresenceChecker $servicePresenceChecker;

    public function __construct(
        AdsCredentialsChecker $adsCredentialsChecker,
        ConfigurationRepository $repository,
        HttpClientInterface $httpClient,
        ServicePresenceChecker $servicePresenceChecker
    ) {
        $this->adsCredentialsChecker = $adsCredentialsChecker;
        $this->repository = $repository;
        $this->httpClient = $httpClient;
        $this->servicePresenceChecker = $servicePresenceChecker;
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
        $content[Configuration::WALLET_NODE_PORT] = (int)($content[Configuration::WALLET_NODE_PORT] ?? 6511);

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

        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $envEditor->set(
            [
                EnvEditor::ADSERVER_ADSHARES_ADDRESS => $content[Configuration::WALLET_ADDRESS],
                EnvEditor::ADSERVER_ADSHARES_NODE_HOST => $content[Configuration::WALLET_NODE_HOST],
                EnvEditor::ADSERVER_ADSHARES_NODE_PORT => $content[Configuration::WALLET_NODE_PORT],
                EnvEditor::ADSERVER_ADSHARES_SECRET => $content[Configuration::WALLET_SECRET_KEY],
            ]
        );

        $data = [
            Configuration::WALLET_ADDRESS => $content[Configuration::WALLET_ADDRESS],
            Configuration::WALLET_NODE_HOST => $content[Configuration::WALLET_NODE_HOST],
            Configuration::WALLET_NODE_PORT => $content[Configuration::WALLET_NODE_PORT],
            Configuration::WALLET_SECRET_KEY => $content[Configuration::WALLET_SECRET_KEY],
            Configuration::INSTALLER_STEP => $this->getName(),
        ];
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

        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $values = $envEditor->get(
            [
                EnvEditor::ADSERVER_ADSHARES_ADDRESS,
                EnvEditor::ADSERVER_ADSHARES_NODE_HOST,
                EnvEditor::ADSERVER_ADSHARES_NODE_PORT,
            ]
        );

        return [
            Configuration::COMMON_DATA_REQUIRED => false,
            Configuration::WALLET_ADDRESS => $values[EnvEditor::ADSERVER_ADSHARES_ADDRESS],
            Configuration::WALLET_NODE_HOST => $values[EnvEditor::ADSERVER_ADSHARES_NODE_HOST],
            Configuration::WALLET_NODE_PORT => $values[EnvEditor::ADSERVER_ADSHARES_NODE_PORT],
        ];
    }

    private static function extractPublicKeyFromSecret(string $secret): string
    {
        $keyPair = sodium_crypto_sign_seed_keypair(hex2bin($secret));
        return strtoupper(bin2hex(sodium_crypto_sign_publickey($keyPair)));
    }

    private function fetchPublicKeyByAddress(string $address): string
    {
        $response = $this->httpClient->request(
            'POST',
            'https://rpc.adshares.net',
            [
                'json' => [
                    'id' => 2,
                    'jsonrpc' => '2.0',
                    'method' => 'get_account',
                    'params' => [
                        'address' => $address
                    ],
                ]
            ]
        );

        return strtoupper(json_decode($response->getContent(), true)['result']['network_account']['public_key']);
    }

    public function isDataRequired(): bool
    {
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));

        $values = $envEditor->get(
            [
                EnvEditor::ADSERVER_ADSHARES_ADDRESS,
                EnvEditor::ADSERVER_ADSHARES_NODE_HOST,
                EnvEditor::ADSERVER_ADSHARES_NODE_PORT,
                EnvEditor::ADSERVER_ADSHARES_SECRET,
            ]
        );

        foreach ($values as $value) {
            if (!$value) {
                return true;
            }
        }

        try {
            $this->adsCredentialsChecker->check(
                $values[EnvEditor::ADSERVER_ADSHARES_ADDRESS],
                $values[EnvEditor::ADSERVER_ADSHARES_SECRET],
                $values[EnvEditor::ADSERVER_ADSHARES_NODE_HOST],
                $values[EnvEditor::ADSERVER_ADSHARES_NODE_PORT],
            );
        } catch (UnexpectedResponseException) {
            return true;
        }

        return true;
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
