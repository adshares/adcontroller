<?php

namespace App\Service;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class AdServerAdminCreator
{
    public function __construct(private readonly string $adServerHomeDirectory)
    {
    }

    public function create(string $email, string $password): void
    {
        $process = new Process(
            ['php', 'artisan', 'ops:admin:create', '--password', $password],
            $this->adServerHomeDirectory,
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
