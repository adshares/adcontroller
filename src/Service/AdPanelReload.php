<?php

namespace App\Service;

use App\Exception\UnexpectedResponseException;
use Psr\Log\LoggerInterface;
use Symfony\Component\Process\Process;

class AdPanelReload
{
    public function __construct(
        private readonly string $adPanelHomeDirectory,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function reload(): void
    {
        $process = new Process(['deploy/reload.sh'], $this->adPanelHomeDirectory);
        $process->setTimeout(null);
        $process->run();
        $process->wait();

        if (!$process->isSuccessful()) {
            $this->logger->error(
                sprintf('AdPanel reload failed (std): %s', $this->formatOutput($process->getOutput()))
            );
            $this->logger->error(
                sprintf('AdPanel reload failed (err): %s', $this->formatOutput($process->getErrorOutput()))
            );
            throw new UnexpectedResponseException('AdPanel reload failed');
        }
    }

    private function formatOutput(string $message): string
    {
        return preg_replace('/\s+/', ' ', $message);
    }
}
