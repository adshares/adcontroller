<?php

namespace App\Service;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class AdServerAdminList
{
    private string $adserverHomeDirectory;

    public function __construct(string $adserverHomeDirectory)
    {
        $this->adserverHomeDirectory = $adserverHomeDirectory;
    }

    public function isAdministratorAccountPresent(): bool
    {
        $process = new Process(
            ['php', 'artisan', 'ops:admin:list'],
            $this->adserverHomeDirectory,
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