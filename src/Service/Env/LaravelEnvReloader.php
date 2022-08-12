<?php

namespace App\Service\Env;

use Symfony\Component\Process\Process;

class LaravelEnvReloader implements EnvReloader
{
    public function __construct(private readonly string $homeDirectory)
    {
    }

    public function reload(): void
    {
        $process = new Process(['php', 'artisan', 'cache:clear'], $this->homeDirectory);
        $process->setTimeout(5);
        $process->run();
        $process->wait();
        if (!$process->isSuccessful()) {
            throw new ReloadException(sprintf('Cannot reload env variables in dir %s', $this->homeDirectory));
        }
    }
}
