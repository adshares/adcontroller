<?php

namespace App\Entity\Enum;

enum AdUser: string implements ConfigurationEnum
{
    public const MODULE = 'AdUser';

    case HOST_PREFIX = 'base_aduser_host_prefix';
    case INTERNAL_URL = 'base_aduser_internal_url';
    case URL = 'base_aduser_url';

    public function getModule(): string
    {
        return self::MODULE;
    }
}
