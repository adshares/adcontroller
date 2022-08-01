<?php

namespace App\Entity\Enum;

enum AdClassifyConfig implements ConfigEnum
{
    public const MODULE = 'AdClassify';

    case ApiKeyName;
    case ApiKeySecret;
    case Url;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
