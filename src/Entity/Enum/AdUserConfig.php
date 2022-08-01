<?php

namespace App\Entity\Enum;

enum AdUserConfig implements ConfigEnum
{
    public const MODULE = 'AdUser';

    case InternalUrl;
    case Url;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
