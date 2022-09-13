<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;

class Regulations extends PlaceholdersConfigurator
{
    protected function fields(): array
    {
        return [
            AdServerConfig::PrivacyPolicy->name,
            AdServerConfig::Terms->name,
        ];
    }
}
