<?php

namespace App\Service;

use App\Entity\Enum\AppConfig;
use App\Repository\ConfigurationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Exception\RuntimeException;
use Symfony\Component\Process\Process;

class AdServerOAuthClientRegistrar
{
    private const CLIENT_ID = 'Client ID:';
    private const CLIENT_NAME = 'AdController';
    private const CLIENT_SECRET = 'Client secret:';
    private const COMMAND_SIGNATURE = 'ops:passport-client:create';

    public function __construct(
        private readonly string $adServerHomeDirectory,
        private readonly ConfigurationRepository $configurationRepository,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function register(string $redirectUri): void
    {
        $process = new Process(
            ['php', 'artisan', self::COMMAND_SIGNATURE, self::CLIENT_NAME, $redirectUri],
            $this->adServerHomeDirectory,
        );
        $process->setTimeout(10);
        $process->run();
        $process->wait();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
        $output = $process->getOutput();

        [$clientId, $clientSecret] = $this->extractClientIdAndSecret($output);
        $this->configurationRepository->insertOrUpdate(AppConfig::MODULE, [
            AppConfig::OAuthClientId->name => $clientId,
            AppConfig::OAuthClientSecret->name => $clientSecret,
        ]);
    }

    private function extractClientIdAndSecret(string $output): array
    {
        $clientId = null;
        $clientSecret = null;
        $line = strtok($output, "\n");
        while (false !== $line) {
            if (str_starts_with($line, self::CLIENT_ID)) {
                $clientId = trim(substr($line, strlen(self::CLIENT_ID)));
            } elseif (str_starts_with($line, self::CLIENT_SECRET)) {
                $clientSecret = trim(substr($line, strlen(self::CLIENT_SECRET)));
            }
            $line = strtok("\n");
        }
        if (null === $clientId || null === $clientSecret) {
            $this->logger->error(sprintf('AdServer command %s did not return id and secret', self::COMMAND_SIGNATURE));
            throw new RuntimeException();
        }

        return [$clientId, $clientSecret];
    }
}
