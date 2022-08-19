<?php

namespace App\Entity\Enum;

enum AdServerConfig implements ConfigEnum
{
    public const MODULE = 'AdServer';

    case ColdWalletAddress;
    case ColdWalletIsActive;
    case HotWalletMaxValue;
    case HotWalletMinValue;
    case LicenseData;
    case LicenseKey;
    case Name;
    case Url;
    case WalletAddress;
    case WalletNodeHost;
    case WalletNodePort;
    case WalletSecretKey;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
