<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;

class Regulations implements ConfiguratorCategory
{
    private const MAXIMUM_CONTENT_LENGTH = 16777210;

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
            if (
                isset($input[$field]) &&
                (!is_string($input[$field]) || strlen($input[$field]) > self::MAXIMUM_CONTENT_LENGTH)
            ) {
                throw new InvalidArgumentException(sprintf('Field `%s` must be a string', $field));
            }
        }

        $this->adServerConfigurationClient->storePlaceholders($input);
        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::PrivacyPolicy->name,
            AdServerConfig::Terms->name,
        ];
    }
}
