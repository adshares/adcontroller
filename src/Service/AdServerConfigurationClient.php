<?php

namespace App\Service;

use App\Entity\Configuration;
use App\Exception\UnexpectedResponseException;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AdServerConfigurationClient
{
    private const KEY_MAP = [
        Configuration::BASE_CONTACT_EMAIL => self::TECHNICAL_EMAIL,
        Configuration::BASE_SUPPORT_EMAIL => self::SUPPORT_EMAIL,
    ];
    private const SUPPORT_EMAIL = 'support-email';
    private const TECHNICAL_EMAIL = 'technical-email';

    private HttpClientInterface $httpClient;
    private TokenStorageInterface $tokenStorage;
    private string $adserverBaseUri;

    public function __construct(HttpClientInterface $httpClient, TokenStorageInterface $tokenStorage, string $adserverBaseUri)
    {
        $this->httpClient = $httpClient;
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

        if (Response::HTTP_OK !== $response->getStatusCode()) {
            throw new UnexpectedResponseException(
                sprintf('AdServer responded with an invalid code (%d)', $response->getStatusCode())
            );
        }

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
                'json' => $this->mapData($data)
            ]
        );

        if (Response::HTTP_OK !== $response->getStatusCode()) {
            throw new UnexpectedResponseException(
                sprintf('AdServer responded with an invalid code (%d)', $response->getStatusCode())
            );
        }
    }

    private function buildUri(): string
    {
        return sprintf('%s/api/config', $this->adserverBaseUri);
    }

    private function getToken(): string
    {
        return $this->tokenStorage->getToken()->getCredentials();
    }

    private function mapData(array $data): array
    {
        $mappedData = [];
        foreach ($data as $key => $value) {
            if (isset(self::KEY_MAP[$key])) {
                $mappedData[self::KEY_MAP[$key]] = $value;
            }
        }

        if (!$mappedData) {
            throw new InvalidArgumentException('No data to store');
        }

        return $mappedData;
    }
}
