<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\GeneralConfig;
use App\Exception\InvalidArgumentException;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;

class BaseInformation implements ConfiguratorCategory
{
    public function __construct(private readonly DataCollector $dataCollector)
    {
    }

    public function process(array $content): array
    {
        $input = ArrayUtils::filterByKeys($content, self::fields());
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }
        $emailFields = [
            GeneralConfig::SupportEmail->name,
            GeneralConfig::TechnicalEmail->name,
        ];
        foreach ($emailFields as $field) {
            if (array_key_exists($field, $input) && false === filter_var($input[$field], FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException(sprintf('Field `%s` must be an e-mail', $field));
            }
        }
        if (
            array_key_exists(AdServerConfig::Name->name, $input) &&
            (!is_string($input[AdServerConfig::Name->name]) || 0 === strlen($input[AdServerConfig::Name->name]))
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must be a non-empty string', AdServerConfig::Name->name)
            );
        }
        if (
            isset($input[GeneralConfig::SupportChat->name]) &&
            false === filter_var($input[GeneralConfig::SupportChat->name], FILTER_VALIDATE_URL)
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must be an url or null', GeneralConfig::SupportChat->name)
            );
        }
        if (
            isset($input[GeneralConfig::SupportTelegram->name]) &&
            (
                !is_string($input[GeneralConfig::SupportTelegram->name]) ||
                0 === strlen($input[GeneralConfig::SupportTelegram->name])
            )
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must be a non-empty string or null', GeneralConfig::SupportTelegram->name)
            );
        }

        return $this->dataCollector->push($input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::Name->name,
            GeneralConfig::SupportChat->name,
            GeneralConfig::SupportEmail->name,
            GeneralConfig::SupportTelegram->name,
            GeneralConfig::TechnicalEmail->name,
        ];
    }
}
