<?php

namespace App\Entity\Enum;

enum AdSelect: string implements ConfigurationEnum
{
    use GetModule;

    case URL = 'adselect_url';
}
