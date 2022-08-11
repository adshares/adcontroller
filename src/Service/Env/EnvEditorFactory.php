<?php

namespace App\Service\Env;

use App\Service\ServicePresenceChecker;
use App\ValueObject\Module;
use Psr\Log\LoggerInterface;
use RuntimeException;

class EnvEditorFactory
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly ServicePresenceChecker $servicePresenceChecker
    ) {
    }

    public function createEnvEditor(Module $module): EnvEditor
    {
        $envReloader = match($module) {
            Module::AdServer => new LaravelEnvReloader($this->servicePresenceChecker->getHomeDirectory($module)),
            default => throw new RuntimeException('Unsupported module'),
        };
        return new EnvEditor(
            $envReloader,
            $this->logger,
            $this->servicePresenceChecker->getEnvFile($module)
        );
    }
}
