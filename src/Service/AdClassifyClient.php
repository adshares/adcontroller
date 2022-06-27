<?php

namespace App\Service;

use App\Exception\UnexpectedResponseException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AdClassifyClient
{
    private const CREATE_URI = '/api/v1/users';

    private HttpClientInterface $httpClient;
    private string $baseUri;

    public function __construct(HttpClientInterface $httpClient, string $adclassifyBaseUri)
    {
        $this->httpClient = $httpClient;
        $this->baseUri = $adclassifyBaseUri;
    }

    public function createAccount(string $email, string $adserverName): array
    {
        $response = $this->httpClient->request(
            'POST',
            $this->baseUri . self::CREATE_URI,
            [
                'json' => ['email' => $email, 'name' => $adserverName]
            ]
        );

        if (Response::HTTP_OK !== $response->getStatusCode()) {
            throw new UnexpectedResponseException(
                sprintf('AdClassify responded with an invalid code (%d)', $response->getStatusCode())
            );
        }

        $body = json_decode($response->getContent(), true);

        if (!isset($body['apiKeyName']) || !isset($body['apiKeySecret'])) {
            throw new UnexpectedResponseException('AdClassify response cannot be processed');
        }

        return [
            'name' => $body['apiKeyName'],
            'secret' => $body['apiKeySecret'],
        ];
    }
}
