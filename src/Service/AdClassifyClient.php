<?php

namespace App\Service;

use App\Exception\UnexpectedResponseException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AdClassifyClient
{
    private const CREATE_URI = '/api/v1/users';
    private const TAXONOMY_URI = '/api/v1/taxonomy';

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

    /**
     * @throws TransportExceptionInterface
     */
    public function validateApiKey(string $apiKeyName, string $apiKeySecret): bool
    {
        $response = $this->httpClient->request(
            'GET',
            $this->adclassifyBaseUri . self::TAXONOMY_URI,
            [
                'headers' => self::buildHeaders($apiKeyName, $apiKeySecret),
            ]
        );

        $statusCode = $response->getStatusCode();
        if (Response::HTTP_FORBIDDEN === $statusCode) {
            return false;
        }
        if (Response::HTTP_OK !== $statusCode) {
            throw new UnexpectedResponseException(
                sprintf('AdClassify responded with an invalid code (%d)', $statusCode)
            );
        }

        return true;
    }

    private static function buildHeaders(string $apiKeyName, string $apiKeySecret): array
    {
        $nonce = base64_encode(self::getNonce());
        $created = date('c');
        $digest = base64_encode(hash('sha256', base64_decode($nonce) . $created . $apiKeySecret, true));

        return [
            'Authorization' => 'WSSE profile="UsernameToken"',
            'X-WSSE' => sprintf(
                'UsernameToken Username="%s", PasswordDigest="%s", Nonce="%s", Created="%s"',
                $apiKeyName,
                $digest,
                $nonce,
                $created
            ),
        ];
    }

    private static function getNonce(): string
    {
        return substr(md5(uniqid()), 0, 16);
    }
}
