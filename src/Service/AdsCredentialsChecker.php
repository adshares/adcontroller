<?php

namespace App\Service;

use Adshares\Ads\AdsClient;
use Adshares\Ads\Driver\CliDriver;
use Adshares\Ads\Exception\CommandException;
use App\Exception\UnexpectedResponseException;
use Psr\Log\LoggerInterface;

class AdsCredentialsChecker
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function check(string $address, string $secret, string $host, int $port): void
    {
        $driver = new CliDriver($address, $secret, $host, $port, $this->logger);
        $adsClient = new AdsClient($driver, $this->logger);

        try {
            $adsClient->getMe();
        } catch (CommandException $exception) {
            $this->logger->debug(sprintf('Invalid credentials (%s)', $exception->getMessage()));
            throw new UnexpectedResponseException('Invalid credentials');
        }
    }
}
