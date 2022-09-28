<?php

namespace App\Service;

use Adshares\Ads\AdsClient;
use Adshares\Ads\Driver\CliDriver;
use Adshares\Ads\Exception\CommandException;
use Adshares\Ads\Util\AdsConverter;
use App\Exception\UnexpectedResponseException;
use Psr\Log\LoggerInterface;

class AdsCredentialsChecker
{
    private const REQUIRED_BALANCE = 1e11;

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
            $response = $adsClient->getMe();
        } catch (CommandException $exception) {
            $message = sprintf('Invalid credentials (%s)', $exception->getMessage());
            $this->logger->debug($message);
            throw new UnexpectedResponseException($message);
        }

        $balance = $response->getAccount()->getBalance();
        if ($balance < self::REQUIRED_BALANCE) {
            throw new UnexpectedResponseException(
                sprintf(
                    'Insufficient funds. At least %.4f ADS is required',
                    (float)AdsConverter::clicksToAds(self::REQUIRED_BALANCE)
                )
            );
        }
    }
}
