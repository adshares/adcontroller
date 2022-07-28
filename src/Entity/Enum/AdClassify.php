<?php

namespace App\Entity\Enum;

enum AdClassify: string implements ConfigurationEnum
{
    use GetModule;

    case ADCLASSIFY_URL = 'adclassify_url';
    case CLASSIFIER_API_KEY_NAME = 'classifier_ext_api_key_name';
    case CLASSIFIER_API_KEY_SECRET = 'classifier_ext_api_key_secret';
}
