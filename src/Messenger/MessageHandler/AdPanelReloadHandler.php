<?php

namespace App\Messenger\MessageHandler;

use App\Exception\UnexpectedResponseException;
use App\Messenger\Message\AdPanelReload;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Process\Process;

#[AsMessageHandler]
class AdPanelReloadHandler
{
    private const TIMEOUT = 15 * 60;

    public function __construct(
        private readonly string $adPanelHomeDirectory,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function __invoke(AdPanelReload $message): void
    {
        $this->reload();
    }

    private function reload(): void
    {
        $process = new Process(['deploy/reload.sh'], $this->adPanelHomeDirectory);
        $process->setTimeout(self::TIMEOUT);
        $process->run();
        $process->wait();

        if (!$process->isSuccessful()) {
            $this->logger->error(
                sprintf('AdPanel reload failed (std): %s', self::formatOutput($process->getOutput()))
            );
            $this->logger->error(
                sprintf('AdPanel reload failed (err): %s', self::formatOutput($process->getErrorOutput()))
            );
            throw new UnexpectedResponseException('AdPanel reload failed');
        }
    }

    private static function formatOutput(string $message): string
    {
        return preg_replace('/\s+/', ' ', $message);
    }
}
