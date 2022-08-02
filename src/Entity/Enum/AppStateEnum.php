<?php

namespace App\Entity\Enum;

enum AppStateEnum: string
{
    case AdserverAccountCreated = 'AdserverAccountCreated';
    case MigrationCompleted = 'MigrationCompleted';
    case InstallationCompleted = 'InstallationCompleted';
}
