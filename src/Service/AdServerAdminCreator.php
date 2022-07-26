<?php

namespace App\Service;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class AdServerAdminCreator
{
    private string $adserverHomeDirectory;

    public function __construct(string $adserverHomeDirectory)
    {
        $this->adserverHomeDirectory = $adserverHomeDirectory;
    }

    public function create(string $email, string $password): void
    {
        $process = new Process(
            ['php', 'artisan', 'ops:admin:create', '--password', $password],
            $this->adserverHomeDirectory,
            null,
            $email,
            5
        );
        $process->run();
        $process->wait();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
    }
}
