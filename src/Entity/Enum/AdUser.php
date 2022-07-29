<?php

namespace App\Entity\Enum;

enum AdUser: string implements ConfigurationEnum
{
    public const MODULE = 'AdUser';

    case BASE_ADUSER_HOST_PREFIX = 'base_aduser_host_prefix';
    case BASE_ADUSER_URL = 'base_aduser_url';
    case BASE_ADUSER_INTERNAL_URL = 'base_aduser_internal_url';

    public function getModule(): string
    {
        return self::MODULE;
    }
}
