<?php

namespace App\Service;

use RuntimeException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class LicenseServerClient
{
    private const CREATE_URI = '/api/v1/license/community';
    private const FETCH_URI = '/api/v1/license/';

    private HttpClientInterface $httpClient;
    private string $licenseServerBaseUri;

    public function __construct(HttpClientInterface $httpClient, string $licenseServerBaseUri)
    {
        $this->httpClient = $httpClient;
        $this->licenseServerBaseUri = $licenseServerBaseUri;
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
            $this->licenseServerBaseUri . self::FETCH_URI . $id
        );

        if (Response::HTTP_OK !== $response->getStatusCode()) {
            throw new RuntimeException();
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
            $this->licenseServerBaseUri . self::CREATE_URI,
            [
                'json' => ['email' => $email, 'name' => $adserverName]
            ]
        );

        if (Response::HTTP_CREATED !== $response->getStatusCode()) {
            throw new RuntimeException();
        }

        return json_decode($response->getContent())->key;
    }
}
