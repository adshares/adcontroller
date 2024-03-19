<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;

class CampaignSettings implements ConfiguratorCategory
{
    public function __construct(private readonly DataCollector $dataCollector)
    {
    }

    public function process(array $content): array
    {
        $fields = self::fields();
        $input = ArrayUtils::filterByKeys($content, $fields);
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }
        ArrayUtils::assurePositiveIntegerTypesForFields($input, $fields);

        return $this->dataCollector->push($input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::CampaignBoostMinBudget->name,
            AdServerConfig::CampaignMinBudget->name,
            AdServerConfig::CampaignMinCpa->name,
            AdServerConfig::CampaignMinCpm->name,
        ];
    }
}
