<?php

namespace App\Service;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class AdServerAdminList
{
    public function __construct(private readonly string $adServerHomeDirectory)
    {
    }

    public function isAdministratorAccountPresent(): bool
    {
        $process = new Process(
            ['php', 'artisan', 'ops:admin:list'],
            $this->adServerHomeDirectory,
        );
        $process->setTimeout(3);
        $process->run();
        $process->wait();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $output = trim($process->getOutput());
        return 'No administrators' !== $output;
    }
}
