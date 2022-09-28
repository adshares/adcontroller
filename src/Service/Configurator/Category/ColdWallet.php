<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use App\Utility\Validator\AdsAccountValidator;
use App\Utility\Validator\ClickAmountValidator;

class ColdWallet implements ConfiguratorCategory
{
    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly DataCollector $dataCollector,
    ) {
    }

    public function process(array $content): array
    {
        $fields = self::fields();
        $input = ArrayUtils::filterByKeys($content, $fields);
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }
        ArrayUtils::assureBoolTypeForField($input, AdServerConfig::ColdWalletIsActive->name);

        if (
            isset($input[AdServerConfig::ColdWalletIsActive->name]) &&
            false === $input[AdServerConfig::ColdWalletIsActive->name]
        ) {
            $data = [
                AdServerConfig::ColdWalletIsActive->name => false,
            ];
            return $this->dataCollector->push($data);
        }

        if (
            array_key_exists(AdServerConfig::ColdWalletAddress->name, $input) &&
            !(new AdsAccountValidator())->valid($input[AdServerConfig::ColdWalletAddress->name])
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must be an ADS account', AdServerConfig::ColdWalletAddress->name)
            );
        }

        $hotWalletRangeFields = [
            AdServerConfig::HotWalletMaxValue->name,
            AdServerConfig::HotWalletMinValue->name,
        ];
        self::assureClickAmountTypeForFields($input, $hotWalletRangeFields);

        $data = array_merge(
            $this->repository->fetchValuesByNames(AdServerConfig::MODULE, $hotWalletRangeFields),
            $input,
        );

        foreach ($hotWalletRangeFields as $field) {
            if (!array_key_exists($field, $data)) {
                throw new InvalidArgumentException(sprintf('Field `%s` is required', $field));
            }
        }

        if (
            isset($data[AdServerConfig::HotWalletMaxValue->name]) &&
            !isset($data[AdServerConfig::HotWalletMinValue->name])
        ) {
            throw new InvalidArgumentException(
                sprintf(
                    'Field `%s` cannot be restored without `%s`',
                    AdServerConfig::HotWalletMinValue->name,
                    AdServerConfig::HotWalletMaxValue->name,
                )
            );
        }

        if (
            !isset($data[AdServerConfig::HotWalletMaxValue->name]) &&
            isset($data[AdServerConfig::HotWalletMinValue->name])
        ) {
            throw new InvalidArgumentException(
                sprintf(
                    'Field `%s` cannot be restored without `%s`',
                    AdServerConfig::HotWalletMaxValue->name,
                    AdServerConfig::HotWalletMinValue->name,
                )
            );
        }

        if (
            isset($data[AdServerConfig::HotWalletMaxValue->name]) &&
            isset($data[AdServerConfig::HotWalletMinValue->name]) &&
            $data[AdServerConfig::HotWalletMaxValue->name] <= $data[AdServerConfig::HotWalletMinValue->name]
        ) {
            throw new InvalidArgumentException(
                sprintf(
                    'Field `%s` must be greater than `%s`',
                    AdServerConfig::HotWalletMaxValue->name,
                    AdServerConfig::HotWalletMinValue->name
                )
            );
        }

        return $this->dataCollector->push($input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::ColdWalletAddress->name,
            AdServerConfig::ColdWalletIsActive->name,
            AdServerConfig::HotWalletMaxValue->name,
            AdServerConfig::HotWalletMinValue->name,
        ];
    }

    private function assureClickAmountTypeForFields(array &$input, array $fields): void
    {
        $validator = new ClickAmountValidator();
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                if (!$validator->valid($input[$field])) {
                    throw new InvalidArgumentException(
                        sprintf('Field `%s` must be a click amount', $field)
                    );
                }

                $input[$field] = (int)$input[$field];
            }
        }
    }
}
