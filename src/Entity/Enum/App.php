<?php

namespace App\Entity\Enum;

enum App: string implements ConfigurationEnum
{
    public const MODULE = 'App';

    case APP_STATE = 'app_state';
    case INSTALLER_STEP = 'installer_step';
    case EMAIL_SENT = 'email_sent';

    public function getModule(): string
    {
        return self::MODULE;
    }
}
