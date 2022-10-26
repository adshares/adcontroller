<?php

namespace App\Entity\Enum;

enum AppConfig implements ConfigEnum
{
    public const MODULE = 'App';

    case AppState;
    case InstallerStep;
    case EmailSent;
    case UploadFileLimit;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
