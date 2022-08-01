<?php

namespace App\Entity\Enum;

enum AdSelectConfig: string implements ConfigEnum
{
    use GetModule;

    case URL = 'adselect_url';
}
