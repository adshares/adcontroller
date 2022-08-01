<?php

namespace App\Entity\Enum;

enum AdSelectConfig implements ConfigEnum
{
    public const MODULE = 'AdSelect';

    case Url;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
