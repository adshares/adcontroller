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
        $fields = self::fields();
        $input = ArrayUtils::filterByKeys($content, $fields);
        if (empty($input)) {
            throw new UnprocessableEntityHttpException('Data is required');
        }

        if (isset($input[AdServerConfig::AllowZoneInIframe->name])) {
            if (
                null === ($value = filter_var(
                    $input[AdServerConfig::AllowZoneInIframe->name],
                    FILTER_VALIDATE_BOOL,
                    FILTER_NULL_ON_FAILURE
                ))
            ) {
                throw new UnprocessableEntityHttpException(
                    sprintf('Field `%s` must be a boolean', AdServerConfig::AllowZoneInIframe->name)
                );
            }

            $input[AdServerConfig::AllowZoneInIframe->name] = $value;
        }

        if (isset($input[AdServerConfig::MaxPageZones->name])) {
            if (!(new PositiveIntegerValidator())->valid($input[AdServerConfig::MaxPageZones->name])) {
                throw new UnprocessableEntityHttpException(
                    sprintf('Field `%s` must be a positive integer', AdServerConfig::MaxPageZones->name)
                );
            }

            $input[AdServerConfig::MaxPageZones->name] = (int)$input[AdServerConfig::MaxPageZones->name];
        }

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
