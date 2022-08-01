<?php

namespace App\Entity\Enum;

enum AdPanelConfig implements ConfigEnum
{
    public const MODULE = 'AdPanel';

    case Url;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
