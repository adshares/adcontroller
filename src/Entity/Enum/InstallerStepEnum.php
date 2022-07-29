<?php

namespace App\Entity\Enum;

enum InstallerStepEnum: string
{
    case BASE = 'base';
    case DNS = 'dns';
    case WALLET = 'wallet';
    case LICENSE = 'license';
    case CLASSIFIER = 'classifier';
    case SMTP = 'smtp';
    case STATUS = 'status';
}
