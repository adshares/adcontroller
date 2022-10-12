<?php

namespace App\Messenger\MessageHandler;

use App\Messenger\Message\AdUserFetchPageData;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

#[AsMessageHandler]
class AdUserFetchPageDataHandler
{
    private const TIMEOUT = 5 * 60;

    public function __construct(private readonly string $adUserHomeDirectory)
    {
    }

    public function __invoke(AdUserFetchPageData $message): void
    {
        $process = new Process(
            ['php', 'bin/console', 'ops:update'],
            $this->adUserHomeDirectory,
            null,
            null,
            self::TIMEOUT
        );
        $process->run();
        $process->wait();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
    }
}
