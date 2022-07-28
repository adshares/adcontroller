<?php

namespace App\Entity\Enum;

enum App: string implements ConfigurationEnum
{
    use GetModule;

    case APP_STATE = 'app_state';
    case INSTALLER_STEP = 'installer_step';
}
