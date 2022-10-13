<?php

namespace App\Messenger\MessageHandler;

use App\Messenger\Message\AdServerGetBlocks;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\Exception\RecoverableMessageHandlingException;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

#[AsMessageHandler]
class AdServerGetBlocksHandler
{
    private const EXIT_CODE_LOCKED = 2;
    private const TIMEOUT = 15 * 60;

    public function __construct(
        private readonly string $adServerHomeDirectory,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function __invoke(AdServerGetBlocks $message): void
    {
        $process = new Process(
            ['php', 'artisan', 'ads:process-tx'],
            $this->adServerHomeDirectory,
            null,
            null,
            self::TIMEOUT
        );
        try {
            $process->run();
            $process->wait();
        } catch (ProcessTimedOutException) {
            $this->logger->error('Error during updating blocks: timeout');
            throw new RecoverableMessageHandlingException();
        }

        if (self::EXIT_CODE_LOCKED === $process->getExitCode()) {
            $this->logger->error('Error during updating blocks: process locked');
            throw new RecoverableMessageHandlingException();
        }

        if (!$process->isSuccessful()) {
            $this->logger->error('Error during updating blocks');
            throw new ProcessFailedException($process);
        }
    }
}
