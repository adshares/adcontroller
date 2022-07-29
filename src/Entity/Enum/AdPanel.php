<?php

namespace App\Entity\Enum;

enum AdPanel: string implements ConfigurationEnum
{
    public const MODULE = 'AdPanel';

    case BASE_ADPANEL_HOST_PREFIX = 'base_adpanel_host_prefix';
    case BASE_ADPANEL_URL = 'base_adpanel_url';

    public function getModule(): string
    {
        return self::MODULE;
    }
}
