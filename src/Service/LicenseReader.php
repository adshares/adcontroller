<?php

declare(strict_types=1);

namespace App\Service;

use App\Exception\OutdatedLicense;
use App\Exception\ServiceNotPresent;
use App\Exception\UnexpectedResponseException;
use App\ValueObject\License;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class LicenseReader
{
    public function __construct(
        private readonly LicenseServerClient $licenseServerClient,
        private readonly LoggerInterface $logger,
    ) {
    }

    /**
     * @throws OutdatedLicense
     */
    public function read(string $licenseKey): License
    {
        try {
            $encodedData = $this->licenseServerClient->fetchEncodedLicenseData($licenseKey);
        } catch (UnexpectedResponseException $unexpectedResponseException) {
            $this->logger->debug(
                sprintf('Unexpected response from license server (%s)', $unexpectedResponseException->getMessage())
            );
            throw $unexpectedResponseException;
        } catch (TransportExceptionInterface $exception) {
            $this->logger->critical(sprintf('License server is not accessible (%s)', $exception->getMessage()));
            throw new ServiceNotPresent('License server is not accessible');
        }

        try {
            $license = (new LicenseDecoder($licenseKey))->decode($encodedData);
        } catch (RuntimeException $exception) {
            $this->logger->debug(sprintf('License cannot be decoded (%s)', $exception->getMessage()));
            throw new UnexpectedResponseException('License cannot be decoded');
        }

        if (!$license->isValid()) {
            $this->logger->debug('License is not valid');
            throw new OutdatedLicense('License expired');
        }

        return $license;
    }
}
