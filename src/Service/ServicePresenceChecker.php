<?php

namespace App\Service;

use App\Exception\ServiceNotPresent;
use App\ValueObject\Module;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Process\Process;

class ServicePresenceChecker
{
    public function __construct(private readonly string $adServerHomeDirectory)
    {
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
            Module::AdServer => $this->getHomeDirectory($module) . '.env',
            default => throw new ServiceNotPresent('Unsupported service'),
        };
    }

    public function getHomeDirectory(Module $module): string
    {
        return match ($module) {
            Module::AdServer => self::canonicalize($this->adServerHomeDirectory),
            default => throw new ServiceNotPresent('Unsupported service'),
        };
    }

    private function checkAdserver(): void
    {
        $filesystem = new Filesystem();

        if (!$filesystem->exists($this->adServerHomeDirectory)) {
            throw new ServiceNotPresent('Home directory does not exists');
        }

        $homeDirectory = self::canonicalize($this->adServerHomeDirectory);
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

    private static function canonicalize(string $homeDirectory): string
    {
        if (!str_ends_with($homeDirectory, '/')) {
            return $homeDirectory . '/';
        }
        return $homeDirectory;
    }
}
