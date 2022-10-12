<?php

namespace App\Messenger\MessageHandler;

use App\Messenger\Message\AdServerCommand;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

#[AsMessageHandler]
class AdServerCommandHandler
{
    private const TIMEOUT = 5 * 60;

    public function __construct(private readonly string $adServerHomeDirectory)
    {
    }

    public function __invoke(AdServerCommand $message): void
    {
        $process = new Process(
            ['php', 'artisan', $message->getSignature(), ...$message->getArguments()],
            $this->adServerHomeDirectory,
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
