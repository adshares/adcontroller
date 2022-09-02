<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use App\Utility\Validator\AdsAccountValidator;

class Whitelist implements ConfiguratorCategory
{
    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly DataCollector $dataCollector,
    ) {
    }

    public function process(array $content): array
    {
        $input = ArrayUtils::filterByKeys($content, self::fields());
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }
        if (
            array_key_exists(AdServerConfig::InventoryPrivate->name, $input) &&
            null === $input[AdServerConfig::InventoryPrivate->name]
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must be a boolean', AdServerConfig::InventoryPrivate->name)
            );
        }
        ArrayUtils::assureBoolTypeForField($input, AdServerConfig::InventoryPrivate->name);

        if (
            isset($input[AdServerConfig::InventoryPrivate->name]) &&
            true === $input[AdServerConfig::InventoryPrivate->name]
        ) {
            $walletAddress = $this->repository->fetchValueByEnum(AdServerConfig::WalletAddress);
            return $this->setCommonWhitelist($walletAddress);
        }

        self::assureAccountIdListTypeForFields(
            $input,
            [
                AdServerConfig::InventoryExportWhitelist->name,
                AdServerConfig::InventoryImportWhitelist->name,
                AdServerConfig::InventoryWhitelist->name,
            ]
        );

        if (isset($input[AdServerConfig::InventoryWhitelist->name])) {
            return $this->setCommonWhitelist($input[AdServerConfig::InventoryWhitelist->name]);
        }

        foreach (
            [
                AdServerConfig::InventoryExportWhitelist->name,
                AdServerConfig::InventoryImportWhitelist->name,
            ] as $field
        ) {
            if (!isset($input[$field])) {
                throw new InvalidArgumentException(sprintf('Field `%s` is required', $field));
            }
        }

        return $this->dataCollector->push([
            AdServerConfig::InventoryExportWhitelist->name => $input[AdServerConfig::InventoryExportWhitelist->name],
            AdServerConfig::InventoryImportWhitelist->name => $input[AdServerConfig::InventoryImportWhitelist->name],
            AdServerConfig::InventoryWhitelist->name => null,
        ]);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::InventoryExportWhitelist->name,
            AdServerConfig::InventoryImportWhitelist->name,
            AdServerConfig::InventoryPrivate->name,
            AdServerConfig::InventoryWhitelist->name,
        ];
    }

    private static function assureAccountIdListTypeForFields(array &$input, array $fields): void
    {
        $validator = new AdsAccountValidator();
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                if (!is_array($input[$field])) {
                    throw new InvalidArgumentException(
                        sprintf('Field `%s` must be an array', $field)
                    );
                }
                $input[$field] = array_unique($input[$field]);
                foreach ($input[$field] as $item) {
                    if (!$validator->valid($item)) {
                        throw new InvalidArgumentException(
                            sprintf('Field `%s` must be a list of ADS accounts', $field)
                        );
                    }
                }
                $input[$field] = join(',', $input[$field]);
            }
        }
    }

    private function setCommonWhitelist(string $whitelist): array
    {
        return $this->dataCollector->push(
            [
                AdServerConfig::InventoryExportWhitelist->name => null,
                AdServerConfig::InventoryImportWhitelist->name => null,
                AdServerConfig::InventoryWhitelist->name => $whitelist,
            ]
        );
    }
}
