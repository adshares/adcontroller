<?php

namespace App\Entity\Enum;

enum PanelAssetConfig implements ConfigEnum
{
    public const MODULE = 'PanelAsset';

    case Favicon16x16;
    case Favicon32x32;
    case Favicon48x48;
    case Favicon96x96;
    case LogoH30;
    case LogoH60;
    case LogoH90;

    public function getModule(): string
    {
        return self::MODULE;
    }

    public function file(): string
    {
        return match ($this) {
            self::Favicon16x16, self::Favicon32x32, self::Favicon48x48, self::Favicon96x96 =>
                strtolower($this->name) . '.png',
            self::LogoH30 => 'logo--white.png',
            self::LogoH60 => 'logo--white@2x.png',
            self::LogoH90 => 'logo--white@3x.png',
        };
    }
}
