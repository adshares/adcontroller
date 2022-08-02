<?php

namespace App\Service;

use App\Exception\UnexpectedResponseException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AdClassifyClient
{
    private const CREATE_URI = '/api/v1/users';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly string $adclassifyBaseUri
    ) {
    }

    /**
     * @throws TransportExceptionInterface
     */
    public function createAccount(string $email, string $adserverName): array
    {
        $response = $this->httpClient->request(
            'POST',
            $this->adclassifyBaseUri . self::CREATE_URI,
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
