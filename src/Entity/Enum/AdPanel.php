<?php

namespace App\Entity\Enum;

enum AdPanel: string implements ConfigurationEnum
{
    use GetModule;

    case BASE_ADPANEL_HOST_PREFIX = 'base_adpanel_host_prefix';
    case BASE_ADPANEL_URL = 'base_adpanel_url';
}
