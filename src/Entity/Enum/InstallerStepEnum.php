<?php

namespace App\Entity\Enum;

enum InstallerStepEnum
{
    case Base;
    case Dns;
    case Wallet;
    case License;
    case Classifier;
    case Smtp;
    case Status;
}
