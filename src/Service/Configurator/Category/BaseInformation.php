<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\GeneralConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;

class BaseInformation implements ConfiguratorCategory
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
            throw new InvalidArgumentException('Data is required');
        }
        $emailFields = [
            GeneralConfig::SupportEmail->name,
            GeneralConfig::TechnicalEmail->name,
        ];
        foreach ($emailFields as $field) {
            if (isset($input[$field]) && false === filter_var($input[$field], FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException(sprintf('Field `%s` must be an e-mail', $field));
            }
        }
        if (
            isset($input[GeneralConfig::SupportChat->name]) &&
            false === filter_var($input[GeneralConfig::SupportChat->name], FILTER_VALIDATE_URL)
        ) {
            throw new InvalidArgumentException(sprintf('Field `%s` must be a url', GeneralConfig::SupportChat->name));
        }
        foreach (
            [
                AdServerConfig::Name->name,
                GeneralConfig::SupportTelegram->name,
            ] as $field
        ) {
            if (isset($input[$field]) && (!is_string($input[$field]) || empty($input[$field]))) {
                throw new InvalidArgumentException(sprintf('Field `%s` must be a non-empty string', $field));
            }
        }

        $this->adServerConfigurationClient->store($input);
        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $input);
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
