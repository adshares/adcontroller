<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;

class SiteOptions implements ConfiguratorCategory
{
    public const ALLOWED_CLASSIFIER_LOCAL_BANNERS_OPTIONS = [
        'all-by-default',
        'local-by-default',
        'local-only',
    ];

    public function __construct(private readonly DataCollector $dataCollector) {
    }

    public function process(array $content): array
    {
        $fields = self::fields();
        $input = ArrayUtils::filterByKeys($content, $fields);
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }
        if (
            array_key_exists(AdServerConfig::SiteAcceptBannersManually->name, $input) &&
            null === $input[AdServerConfig::SiteAcceptBannersManually->name]
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must be a boolean', AdServerConfig::SiteAcceptBannersManually->name)
            );
        }
        ArrayUtils::assureBoolTypeForField($input, AdServerConfig::SiteAcceptBannersManually->name);

        if (
            array_key_exists(AdServerConfig::SiteClassifierLocalBanners->name, $input) &&
            !in_array(
                $input[AdServerConfig::SiteClassifierLocalBanners->name],
                self::ALLOWED_CLASSIFIER_LOCAL_BANNERS_OPTIONS,
                true
            )
        ) {
            throw new InvalidArgumentException(
                sprintf(
                    'Field `%s` must be one of (%s)',
                    AdServerConfig::SiteClassifierLocalBanners->name,
                    join(', ', self::ALLOWED_CLASSIFIER_LOCAL_BANNERS_OPTIONS)
                )
            );
        }

        return $this->dataCollector->push($input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::SiteAcceptBannersManually->name,
            AdServerConfig::SiteClassifierLocalBanners->name,
        ];
    }
}
