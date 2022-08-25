<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;

class SiteOptions implements ConfiguratorCategory
{
    public const ALLOWED_CLASSIFIER_LOCAL_BANNERS_OPTIONS = [
        'all-by-default',
        'local-by-default',
        'local-only',
    ];

    public function __construct(
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
    ) {
    }

    public function process(array $content): void
    {
        $fields = self::fields();
        $input = ArrayUtils::filterByKeys($content, $fields);
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }
        ArrayUtils::assureBoolTypeForField($input, AdServerConfig::SiteAcceptBannersManually->name);

        if (
            isset($input[AdServerConfig::SiteClassifierLocalBanners->name]) &&
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

        $this->adServerConfigurationClient->store($input);
        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::SiteAcceptBannersManually->name,
            AdServerConfig::SiteClassifierLocalBanners->name,
        ];
    }
}