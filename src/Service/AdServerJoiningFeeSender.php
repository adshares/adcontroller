<?php

namespace App\Service;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class AdServerJoiningFeeSender
{
    public function __construct(private readonly string $adServerHomeDirectory)
    {
    }

    public function send(string $walletAddress, string $amount): void
    {
        $process = new Process(
            ['php', 'artisan', 'ops:supply:joining-fee', $walletAddress, $amount],
            $this->adServerHomeDirectory,
            null,
            null,
            5,
        );
        $process->run();
        $process->wait();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
    }
}
