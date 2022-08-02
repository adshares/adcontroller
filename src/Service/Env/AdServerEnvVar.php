<?php

namespace App\Service\Env;

enum AdServerEnvVar: string
{
    case AppHost = 'APP_HOST';
    case AppName = 'APP_NAME';
    case AppSetup = 'APP_SETUP';
    case AppUrl = 'APP_URL';
}
