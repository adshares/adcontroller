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
        foreach (
            [
                AdServerConfig::AdsTxtCheckSupplyEnabled->name,
                AdServerConfig::SiteAcceptBannersManually->name,
            ] as $field
        ) {
            if (array_key_exists($field, $input) && null === $input[$field]) {
                throw new InvalidArgumentException(sprintf('Field `%s` must be a boolean', $field));
            }
            ArrayUtils::assureBoolTypeForField($input, $field);
        }

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
        if (
            array_key_exists(AdServerConfig::AdsTxtCheckSupplyEnabled->name, $input) &&
            false === $input[AdServerConfig::AdsTxtCheckSupplyEnabled->name]
        ) {
            $input[AdServerConfig::AdsTxtDomain->name] = null;
        }
        if (
            isset($input[AdServerConfig::AdsTxtDomain->name]) &&
            false === filter_var(
                $input[AdServerConfig::AdsTxtDomain->name],
                FILTER_VALIDATE_DOMAIN,
                FILTER_FLAG_HOSTNAME,
            )
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must be a domain', AdServerConfig::AdsTxtDomain->name)
            );
        }

        return $this->dataCollector->push($input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::AdsTxtCheckSupplyEnabled->name,
            AdServerConfig::AdsTxtDomain->name,
            AdServerConfig::SiteAcceptBannersManually->name,
            AdServerConfig::SiteClassifierLocalBanners->name,
        ];
    }
}
