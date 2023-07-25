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
    case LogoSimpleH30;
    case LogoDarkModeH30;
    case LogoSimpleDarkModeH30;

    public function getModule(): string
    {
        return self::MODULE;
    }

    public function filePath(): string
    {
        return match ($this) {
            self::Favicon16x16 => '/favicon-16x16.png',
            self::Favicon32x32 => '/favicon-32x32.png',
            self::Favicon48x48 => '/favicon-48x48.png',
            self::Favicon96x96 => '/favicon-96x96.png',
            self::LogoH30 => '/logo.png',
            self::LogoSimpleH30 => '/logo-simple.png',
            self::LogoDarkModeH30 => '/logo-dark-mode.png',
            self::LogoSimpleDarkModeH30 => '/logo-simple-dark-mode.png',
        };
    }
}
