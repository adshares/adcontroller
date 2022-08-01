<?php

namespace App\Entity\Enum;

enum AdPanelConfig: string implements ConfigEnum
{
    public const MODULE = 'AdPanel';

    case URL = 'base_adpanel_url';

    public function getModule(): string
    {
        return self::MODULE;
    }
}
