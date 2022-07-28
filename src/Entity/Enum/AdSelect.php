<?php

namespace App\Entity\Enum;

enum AdSelect: string implements ConfigurationEnum
{
    use GetModule;

    case ADSELECT_URL = 'adselect_url';
}
