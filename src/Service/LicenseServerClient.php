<?php

namespace App\Service;

use App\Exception\UnexpectedResponseException;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class LicenseServerClient
{
    private const CREATE_URI = '/api/v1/license/community';
    private const FETCH_URI = '/api/v1/license/';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly string $licenseServerBaseUri
    ) {
    }

    /**
     * Fetches license data
     *
     * @param string $id license id
     * @return string encoded license data
     * @throws TransportExceptionInterface
     */
    public function fetchEncodedLicenseData(string $id): string
    {
        $response = $this->httpClient->request(
            'GET',
            $this->licenseServerBaseUri . self::FETCH_URI . $id
        );

        if (Response::HTTP_OK !== $response->getStatusCode()) {
            $errorMessage = sprintf('Unexpected status code (%d)', $response->getStatusCode());
            $this->logger->debug($errorMessage);
            throw new UnexpectedResponseException($errorMessage);
        }

        return json_decode($response->getContent())->data;
    }

    /**
     * Creates community license
     *
     * @param string $email e-mail address
     * @param string $adserverName AdServer's name
     * @return string license key (secret)
     * @throws TransportExceptionInterface
     */
    public function createCommunityLicense(string $email, string $adserverName): string
    {
        $response = $this->httpClient->request(
            'POST',
            $this->licenseServerBaseUri . self::CREATE_URI,
            [
                'json' => ['email' => $email, 'name' => $adserverName]
            ]
        );

        if (Response::HTTP_CREATED !== $response->getStatusCode()) {
            $errorMessage = sprintf('Unexpected status code (%d)', $response->getStatusCode());
            $this->logger->debug($errorMessage);
            throw new UnexpectedResponseException($errorMessage);
        }

        return json_decode($response->getContent())->key;
    }
}
