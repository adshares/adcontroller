<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;

class DemandSettlementOptions implements ConfiguratorCategory
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

        $field = AdServerConfig::AdsTxtCheckDemandEnabled->name;
        if (array_key_exists($field, $input) && null === $input[$field]) {
            throw new InvalidArgumentException(sprintf('Field `%s` must be a boolean', $field));
        }
        ArrayUtils::assureBoolTypeForField($input, $field);

        return $this->dataCollector->push($input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::AdsTxtCheckDemandEnabled->name,
        ];
    }
}
