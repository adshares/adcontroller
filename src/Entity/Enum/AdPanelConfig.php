<?php

namespace App\Entity\Enum;

enum AdPanelConfig implements ConfigEnum
{
    public const MODULE = 'AdPanel';

    case PlaceholderIndexDescription;
    case PlaceholderIndexKeywords;
    case PlaceholderIndexMetaTags;
    case PlaceholderIndexTitle;
    case PlaceholderLoginInfo;
    case PlaceholderRobotsTxt;
    case Url;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
