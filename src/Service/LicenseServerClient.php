<?php

namespace App\Service;

use App\Exception\UnexpectedResponseException;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class LicenseServerClient
{
    private const CREATE_URI = '/api/v1/license/community';
    private const FETCH_URI = '/api/v1/license/';

    private HttpClientInterface $httpClient;
    private LoggerInterface $logger;
    private string $baseUri;

    public function __construct(HttpClientInterface $httpClient, LoggerInterface $logger, string $licenseServerBaseUri)
    {
        $this->httpClient = $httpClient;
        $this->logger = $logger;
        $this->baseUri = $licenseServerBaseUri;
    }

    /**
     * Fetches license data
     *
     * @param string $id license id
     * @return string encoded license data
     */
    public function fetchEncodedLicenseData(string $id): string
    {
        $response = $this->httpClient->request(
            'GET',
            $this->baseUri . self::FETCH_URI . $id
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
     */
    public function createCommunityLicense(string $email, string $adserverName): string
    {
        $response = $this->httpClient->request(
            'POST',
            $this->baseUri . self::CREATE_URI,
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
