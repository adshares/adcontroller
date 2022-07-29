<?php

namespace App\Entity\Enum;

enum AdPanel: string implements ConfigurationEnum
{
    public const MODULE = 'AdPanel';

    case HOST_PREFIX = 'base_adpanel_host_prefix';
    case URL = 'base_adpanel_url';

    public function getModule(): string
    {
        return self::MODULE;
    }
}
