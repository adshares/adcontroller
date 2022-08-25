<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;

class CrmNotifications implements ConfiguratorCategory
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
            throw new InvalidArgumentException('Data is required');
        }

        foreach ($fields as $field) {
            if (isset($input[$field]) && false === filter_var($input[$field], FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException(sprintf('Field `%s` must be an e-mail', $field));
            }
        }

        $this->adServerConfigurationClient->store($input);
        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $input);
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
