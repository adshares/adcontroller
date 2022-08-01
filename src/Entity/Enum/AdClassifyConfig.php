<?php

namespace App\Entity\Enum;

enum AdClassifyConfig: string implements ConfigEnum
{
    public const MODULE = 'AdClassify';

    case API_KEY_NAME = 'classifier_ext_api_key_name';
    case API_KEY_SECRET = 'classifier_ext_api_key_secret';
    case URL = 'adclassify_url';

    public function getModule(): string
    {
        return self::MODULE;
    }
}
