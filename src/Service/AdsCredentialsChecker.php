<?php

namespace App\Service;

use Adshares\Ads\AdsClient;
use Adshares\Ads\Driver\CliDriver;
use Adshares\Ads\Exception\CommandException;
use App\Exception\UnexpectedResponseException;
use Psr\Log\LoggerInterface;

class AdsCredentialsChecker
{
    public function __construct(
        private readonly string $buildDirectory,
        private readonly LoggerInterface $logger
    ) {
    }

    public function check(string $address, string $secret, string $host, int $port): void
    {
        $driver = new CliDriver($address, $secret, $host, $port, $this->logger);
        $driver->setWorkingDir($this->buildDirectory . DIRECTORY_SEPARATOR . 'wallet');
        $adsClient = new AdsClient($driver, $this->logger);

        try {
            $adsClient->getMe();
        } catch (CommandException $exception) {
            $message = sprintf('Invalid credentials (%s)', $exception->getMessage());
            $this->logger->debug($message);
            throw new UnexpectedResponseException($message);
        }
    }
}
