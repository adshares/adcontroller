<?php

namespace App\Service;

use App\Exception\ServiceNotPresent;
use App\Utility\DirUtils;
use App\ValueObject\Module;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Process\Process;

class ServicePresenceChecker
{
    public function __construct(
        private readonly string $adPanelHomeDirectory,
        private readonly string $adServerHomeDirectory,
    ) {
    }

    public function check(Module $module): void
    {
        switch ($module) {
            case Module::AdServer:
                $this->checkAdserver();
                break;
            default:
                throw new ServiceNotPresent('Unsupported service');
        }
    }

    public function getEnvFile(Module $module): string
    {
        return match ($module) {
            Module::AdPanel, Module::AdServer => $this->getHomeDirectory($module) . '.env',
            default => throw new ServiceNotPresent('Unsupported service'),
        };
    }

    public function getHomeDirectory(Module $module): string
    {
        $directory = match ($module) {
            Module::AdPanel => $this->adPanelHomeDirectory,
            Module::AdServer => $this->adServerHomeDirectory,
            default => throw new ServiceNotPresent('Unsupported service'),
        };
        return DirUtils::canonicalize($directory);
    }

    private function checkAdserver(): void
    {
        $filesystem = new Filesystem();

        if (!$filesystem->exists($this->adServerHomeDirectory)) {
            throw new ServiceNotPresent('Home directory does not exists');
        }

        $homeDirectory = DirUtils::canonicalize($this->adServerHomeDirectory);
        $files = [
            'artisan',
            '.env'
        ];

        foreach ($files as $file) {
            if (!$filesystem->exists($homeDirectory . $file)) {
                throw new ServiceNotPresent(sprintf('File `%s` is missing', $file));
            }
        }

        $process = new Process(['php', 'artisan'], $homeDirectory);
        $process->setTimeout(2);
        $process->run();
        $process->wait();
        if (!$process->isSuccessful()) {
            throw new ServiceNotPresent('Cannot execute `artisan` command');
        }
    }
}
