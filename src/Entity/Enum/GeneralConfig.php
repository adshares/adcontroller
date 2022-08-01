<?php

namespace App\Entity\Enum;

enum GeneralConfig implements ConfigEnum
{
    public const MODULE = 'General';

    case Domain;
    case SmtpHost;
    case SmtpPassword;
    case SmtpPort;
    case SmtpSender;
    case SmtpUsername;
    case SupportEmail;
    case TechnicalEmail;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
