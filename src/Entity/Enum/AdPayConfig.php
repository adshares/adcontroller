<?php

namespace App\Entity\Enum;

enum AdPayConfig: string implements ConfigEnum
{
    use GetModule;

    case URL = 'adpay_url';
}
