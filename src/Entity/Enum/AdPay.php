<?php

namespace App\Entity\Enum;

enum AdPay: string implements ConfigurationEnum
{
    use GetModule;

    case ADPAY_URL = 'adpay_url';
}
