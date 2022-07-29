<?php

namespace App\Entity\Enum;

enum AdPay: string implements ConfigurationEnum
{
    use GetModule;

    case URL = 'adpay_url';
}
