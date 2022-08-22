<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;
use App\Utility\Validator\PositiveIntegerValidator;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ZoneOptions implements ConfiguratorCategory
{
    public function __construct(
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
    ) {
    }

    public function process(array $content): void
    {
        $input = ArrayUtils::filterByKeys($content, self::fields());
        if (empty($input)) {
            throw new UnprocessableEntityHttpException('Data is required');
        }
        ArrayUtils::assureBoolTypeForField($input, AdServerConfig::AllowZoneInIframe->name);
        ArrayUtils::assurePositiveIntegerTypesForFields($input, [AdServerConfig::MaxPageZones->name]);

        $this->adServerConfigurationClient->store($input);
        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::AllowZoneInIframe->name,
            AdServerConfig::MaxPageZones->name,
        ];
    }
}
