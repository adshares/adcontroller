<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;
use App\Utility\Validator\AdsAccountValidator;

class Whitelist implements ConfiguratorCategory
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
        ArrayUtils::assureBoolTypeForField($input, AdServerConfig::InventoryPrivate->name);

        if (
            isset($input[AdServerConfig::InventoryPrivate->name]) &&
            true === $input[AdServerConfig::InventoryPrivate->name]
        ) {
            $walletAddress = $this->repository->fetchValueByEnum(AdServerConfig::WalletAddress);
            $this->setCommonWhitelist($walletAddress);
            return;
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
            $this->setCommonWhitelist($input[AdServerConfig::InventoryWhitelist->name]);
            return;
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

        $exportWhitelist = $input[AdServerConfig::InventoryExportWhitelist->name];
        $importWhitelist = $input[AdServerConfig::InventoryImportWhitelist->name];
        $this->adServerConfigurationClient->store([
            AdServerConfig::InventoryExportWhitelist->name => $exportWhitelist,
            AdServerConfig::InventoryImportWhitelist->name => $importWhitelist,
            AdServerConfig::InventoryWhitelist->name => null,
        ]);
        $this->repository->insertOrUpdate(
            AdServerConfig::MODULE,
            [
                AdServerConfig::InventoryExportWhitelist->name => $exportWhitelist,
                AdServerConfig::InventoryImportWhitelist->name => $importWhitelist,
            ]
        );
        $this->repository->remove(AdServerConfig::InventoryWhitelist);
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

    private function setCommonWhitelist(string $whitelist): void
    {
        $this->adServerConfigurationClient->store([
            AdServerConfig::InventoryExportWhitelist->name => null,
            AdServerConfig::InventoryImportWhitelist->name => null,
            AdServerConfig::InventoryWhitelist->name => $whitelist,
        ]);
        $this->repository->remove(AdServerConfig::InventoryExportWhitelist);
        $this->repository->remove(AdServerConfig::InventoryImportWhitelist);
        $this->repository->insertOrUpdateOne(AdServerConfig::InventoryWhitelist, $whitelist);
    }
}
