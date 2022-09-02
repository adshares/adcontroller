<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;

class CrmNotifications implements ConfiguratorCategory
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

        foreach ($fields as $field) {
            if (isset($input[$field]) && false === filter_var($input[$field], FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException(sprintf('Field `%s` must be an e-mail', $field));
            }
        }

        return $this->dataCollector->push($input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::CrmMailAddressOnCampaignCreated->name,
            AdServerConfig::CrmMailAddressOnSiteAdded->name,
            AdServerConfig::CrmMailAddressOnUserRegistered->name,
        ];
    }
}
