<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ZoneOptions implements ConfiguratorCategory
{
    public function __construct(private readonly DataCollector $dataCollector)
    {
    }

    public function process(array $content): array
    {
        $input = ArrayUtils::filterByKeys($content, self::fields());
        if (empty($input)) {
            throw new UnprocessableEntityHttpException('Data is required');
        }
        ArrayUtils::assureBoolTypeForField($input, AdServerConfig::AllowZoneInIframe->name);
        ArrayUtils::assurePositiveIntegerTypesForFields(
            $input,
            [AdServerConfig::BannerRotateInterval->name, AdServerConfig::MaxPageZones->name]
        );

        return $this->dataCollector->push($input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::AllowZoneInIframe->name,
            AdServerConfig::BannerRotateInterval->name,
            AdServerConfig::MaxPageZones->name,
        ];
    }
}
