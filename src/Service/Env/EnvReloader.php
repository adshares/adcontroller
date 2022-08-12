<?php

namespace App\Service\Env;

interface EnvReloader
{
    /**
     * @throws ReloadException
     */
    public function reload(): void;
}
