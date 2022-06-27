<?php

namespace App\Service;

use App\Exception\ServiceNotPresent;
use App\ValueObject\Module;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Process\Process;

class ServicePresenceChecker
{
    private string $adserverHomeDirectory;

    public function __construct(string $adserverHomeDirectory)
    {
        $this->adserverHomeDirectory = $adserverHomeDirectory;
    }

    public function check(Module $module): void
    {
        switch ($module->toString()) {
            case Module::ADSERVER:
                $this->checkAdserver();
                break;
            default:
                throw new ServiceNotPresent('Unsupported service');
        }
    }

    public function getEnvFile(Module $module): string
    {
        switch ($module->toString()) {
            case Module::ADSERVER:
                return self::canonicalize($this->adserverHomeDirectory) . '.env';
            default:
                throw new ServiceNotPresent('Unsupported service');
        }
    }

    private function checkAdserver(): void
    {
        $filesystem = new Filesystem();

        if (!$filesystem->exists($this->adserverHomeDirectory)) {
            throw new ServiceNotPresent('Home directory does not exists');
        }

        $homeDirectory = self::canonicalize($this->adserverHomeDirectory);
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

    private static function canonicalize(string $homeDirectory): string
    {
        if (!str_ends_with($homeDirectory, '/')) {
            return $homeDirectory . '/';
        }
        return $homeDirectory;
    }
}
