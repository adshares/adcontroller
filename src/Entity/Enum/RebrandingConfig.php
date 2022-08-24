<?php

namespace App\Entity\Enum;

enum RebrandingConfig implements ConfigEnum
{
    case Favicon16x16;
    case Favicon32x32;
    case Favicon48x48;
    case Favicon96x96;
    case LogoH30;
    case LogoH60;
    case LogoH90;
    public const MODULE = 'Rebranding';

    case PlaceholderIndexDescription;
    case PlaceholderIndexKeywords;
    case PlaceholderIndexMetaTags;
    case PlaceholderIndexTitle;
    case PlaceholderRobotsTxt;
    case Url;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
