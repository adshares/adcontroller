<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\EnvEditor;
use App\Service\ServicePresenceChecker;
use App\ValueObject\AccountId;
use App\ValueObject\Module;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WalletStep implements InstallerStep
{
    private const DEFAULT_ENV_ADSHARES_ADDRESS = '0001-00000000-9B6F';
    private const FIELDS = [
        Configuration::WALLET_ADDRESS,
        Configuration::WALLET_SECRET_KEY,
    ];

    private ConfigurationRepository $repository;
    private HttpClientInterface $httpClient;
    private ServicePresenceChecker $servicePresenceChecker;

    public function __construct(
        ConfigurationRepository $repository,
        HttpClientInterface $httpClient,
        ServicePresenceChecker $servicePresenceChecker
    ) {
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

        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $envEditor->set(
            [
                EnvEditor::ADSERVER_ADSHARES_ADDRESS => $content[Configuration::WALLET_ADDRESS],
                EnvEditor::ADSERVER_ADSHARES_SECRET => $content[Configuration::WALLET_SECRET_KEY],
            ]
        );

        $data = [];
        foreach (self::FIELDS as $field) {
            $data[$field] = strtoupper($content[$field]);
        }
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
        if (1 !== preg_match('/^[0-9A-F]{64}$/i', $content[Configuration::WALLET_SECRET_KEY])) {
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

        $address = $content[Configuration::WALLET_ADDRESS];
        $secret = $content[Configuration::WALLET_SECRET_KEY];
        if ($this->fetchPublicKeyByAddress($address) !== self::extractPublicKeyFromSecret($secret)) {
            throw new UnprocessableEntityHttpException('Secret key does not match ADS account\'s address');
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
        $address = $envEditor->getOne(EnvEditor::ADSERVER_ADSHARES_ADDRESS);

        return [
            Configuration::COMMON_DATA_REQUIRED => false,
            Configuration::WALLET_ADDRESS => $address,
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
                EnvEditor::ADSERVER_ADSHARES_SECRET,
            ]
        );

        foreach ($values as $value) {
            if (!$value) {
                return true;
            }
        }

        if (self::DEFAULT_ENV_ADSHARES_ADDRESS === $values[EnvEditor::ADSERVER_ADSHARES_ADDRESS]) {
            return true;
        }

        return false;
    }
}
