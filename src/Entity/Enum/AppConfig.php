<?php

namespace App\Entity\Enum;

enum AppConfig implements ConfigEnum
{
    public const MODULE = 'App';

    case AppState;
    case InstallerStep;
    case EmailSent;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
