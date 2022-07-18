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
    public const RESOURCE_MAIL = 'mail';
    private const ALLOWED_API_RESOURCES = [
        self::RESOURCE_MAIL,
    ];
    private const MAP = [
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

    public function fetch(string $apiResource): array
    {
        $this->validateApiResource($apiResource);
        $uri = $this->buildUriByApiResource($apiResource);

        $response = $this->httpClient->request('GET', $uri);

        if (Response::HTTP_OK !== $response->getStatusCode()) {
            throw new UnexpectedResponseException(
                sprintf('AdServer responded with an invalid code (%d)', $response->getStatusCode())
            );
        }

        $body = json_decode($response->getContent(), true);

        switch ($apiResource) {
            case self::RESOURCE_MAIL:
                if (!isset($body[self::SUPPORT_EMAIL]) || !isset($body[self::TECHNICAL_EMAIL])) {
                    throw new UnexpectedResponseException('AdServer response cannot be processed');
                }

                return [
                    Configuration::BASE_SUPPORT_EMAIL => $body[self::SUPPORT_EMAIL],
                    Configuration::BASE_CONTACT_EMAIL => $body[self::TECHNICAL_EMAIL],
                ];
            default:
                return [];
        }
    }

    public function store(string $apiResource, array $data): void
    {
        $this->validateApiResource($apiResource);
        $uri = $this->buildUriByApiResource($apiResource);
        $token = $this->tokenStorage->getToken()->getCredentials();

        $response = $this->httpClient->request(
            'PATCH',
            $uri,
            [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
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

    private function validateApiResource(string $apiResource): void
    {
        if (!in_array($apiResource, self::ALLOWED_API_RESOURCES)) {
            throw new InvalidArgumentException(sprintf('Value `%s` is not a valid API resource', $apiResource));
        }
    }

    private function buildUriByApiResource(string $apiResource): string
    {
        return sprintf('%s/api/config/%s', $this->adserverBaseUri, $apiResource);
    }

    private function mapData(array $data): array
    {
        $mappedData = [];
        foreach ($data as $key => $value) {
            if (isset(self::MAP[$key])) {
                $mappedData[self::MAP[$key]] = $value;
            }
        }

        if (!$mappedData) {
            throw new InvalidArgumentException('No data to store');
        }

        return $mappedData;
    }
}
