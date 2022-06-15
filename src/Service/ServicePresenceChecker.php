<?php

namespace App\Service;

use App\Exception\ServiceNotPresent;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Process\Process;

class ServicePresenceChecker
{
    private string $adserverHomeDirectory;

    public function __construct(string $adserverHomeDirectory)
    {
        $this->adserverHomeDirectory = $adserverHomeDirectory;
    }

    public function check(string $module): void
    {
        switch ($module) {
            case 'adserver':
                $this->checkAdserver();
                break;
            default:
                throw new ServiceNotPresent('Unsupported service');
        }
    }

    private function checkAdserver(): void
    {
        $filesystem = new Filesystem();
        $homeDirectory = $this->adserverHomeDirectory;

        if (!$filesystem->exists($homeDirectory)) {
            throw new ServiceNotPresent('Home directory does not exists');
        }

        if (!str_ends_with($homeDirectory, '/')) {
            $homeDirectory .= '/';
        }

        $files = [
            'artisan',
            '.env'
        ];

        foreach ($files as $file) {
            if (!$filesystem->exists($homeDirectory . $file)) {
                throw new ServiceNotPresent(sprintf('File `%s` is missing', $file));
            }
        }

        $process = new Process(['php7.4', 'artisan'], $homeDirectory);
        $process->setTimeout(1);
        $process->run();
        $process->wait();
        if (!$process->isSuccessful()) {
            throw new ServiceNotPresent('Cannot execute `artisan` command');
        }
    }
}
