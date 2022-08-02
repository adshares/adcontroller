<?php

namespace App\Entity\Enum;

enum AdPayConfig implements ConfigEnum
{
    public const MODULE = 'AdPay';

    case Url;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
