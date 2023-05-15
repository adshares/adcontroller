<?php

namespace App\Messenger\MessageHandler;

use App\Exception\UnexpectedResponseException;
use App\Messenger\Message\AdControllerReload;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Process\Process;

#[AsMessageHandler]
class AdControllerReloadHandler
{
    private const TIMEOUT = 15 * 60;

    public function __construct(
        private readonly string $appDirectory,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function __invoke(AdControllerReload $message): void
    {
        $this->reload();
    }

    private function reload(): void
    {
        $process = new Process(['deploy/reload.sh'], $this->appDirectory);
        $process->setTimeout(self::TIMEOUT);
        $process->run();
        $process->wait();

        if (!$process->isSuccessful()) {
            $this->logger->error(
                sprintf('AdController reload failed (std): %s', self::formatOutput($process->getOutput()))
            );
            $this->logger->error(
                sprintf('AdController reload failed (err): %s', self::formatOutput($process->getErrorOutput()))
            );
            throw new UnexpectedResponseException('AdController reload failed');
        }
    }

    private static function formatOutput(string $message): string
    {
        return preg_replace('/\s+/', ' ', $message);
    }
}
