<?php

namespace App\Entity\Enum;

enum General: string implements ConfigurationEnum
{
    public const MODULE = 'General';

    case BASE_DOMAIN = 'base_domain';
    case BASE_SUPPORT_EMAIL = 'base_support_email';
    case BASE_TECHNICAL_EMAIL = 'base_technical_email';
    case SMTP_EMAIL_SENT = 'smtp_email_sent';
    case SMTP_HOST = 'smtp_host';
    case SMTP_PASSWORD = 'smtp_password';
    case SMTP_PORT = 'smtp_port';
    case SMTP_SENDER = 'smtp_sender';
    case SMTP_USERNAME = 'smtp_username';

    public function getModule(): string
    {
        return self::MODULE;
    }
}
