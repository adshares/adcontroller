<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdPanelConfig;

class PanelPlaceholders extends PlaceholdersConfigurator
{
    protected function fields(): array
    {
        return [
            AdPanelConfig::PlaceholderIndexDescription->name,
            AdPanelConfig::PlaceholderIndexKeywords->name,
            AdPanelConfig::PlaceholderIndexMetaTags->name,
            AdPanelConfig::PlaceholderIndexTitle->name,
            AdPanelConfig::PlaceholderLoginInfo->name,
            AdPanelConfig::PlaceholderRobotsTxt->name,
        ];
    }
}
