<?php

namespace App\Service;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class AdserverAdminCreator
{
    public function create(string $email, string $password): void
    {
        $adserverHomeDirectory = '/home/pp/repo/adserver';

        $process = new Process(
            ['php7.4', 'artisan', 'ops:admin:create', '--password', $password],
            $adserverHomeDirectory,
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
