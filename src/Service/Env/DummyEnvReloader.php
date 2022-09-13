<?php

namespace App\Service\Env;

class DummyEnvReloader implements EnvReloader
{
    public function reload(): void
    {
        // do nothing
    }
}
