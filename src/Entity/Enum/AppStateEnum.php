<?php

namespace App\Entity\Enum;

enum AppStateEnum: string
{
    case ADSERVER_ACCOUNT_CREATED = 'adserver_account_created';
    case MIGRATION_COMPLETED = 'migration_completed';
    case INSTALLATION_COMPLETED = 'installation_completed';
}
