<?php

namespace App\Service\Env;

use App\Service\ServicePresenceChecker;
use App\ValueObject\Module;
use Psr\Log\LoggerInterface;

class EnvEditorFactory
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly ServicePresenceChecker $servicePresenceChecker
    ) {
    }

    public function createEnvEditor(Module $module): EnvEditor
    {
        return new EnvEditor($this->logger, $this->servicePresenceChecker->getEnvFile($module));
    }
}
