<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;
use App\Utility\Validator\AdsAccountValidator;
use App\Utility\Validator\ClickAmountValidator;

class ColdWallet implements ConfiguratorCategory
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
        ArrayUtils::assureBoolTypeForField($input, AdServerConfig::ColdWalletIsActive->name);

        if (
            isset($input[AdServerConfig::ColdWalletIsActive->name]) &&
            false === $input[AdServerConfig::ColdWalletIsActive->name]
        ) {
            $data = [
                AdServerConfig::ColdWalletIsActive->name => false,
            ];
            $this->adServerConfigurationClient->store($data);
            $this->repository->insertOrUpdate(AdServerConfig::MODULE, $data);
            return;
        }

        if (
            isset($input[AdServerConfig::ColdWalletAddress->name]) &&
            !(new AdsAccountValidator())->valid($input[AdServerConfig::ColdWalletAddress->name])
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must be an ADS account', AdServerConfig::ColdWalletAddress->name)
            );
        }

        self::assureClickAmountTypeForFields(
            $input,
            [
                AdServerConfig::HotWalletMaxValue->name,
                AdServerConfig::HotWalletMinValue->name,
            ]
        );

        $data = array_merge(
            $this->repository->fetchValuesByNames(AdServerConfig::MODULE, $fields),
            $input,
        );

        foreach ($fields as $field) {
            if (!isset($data[$field])) {
                throw new InvalidArgumentException(sprintf('Field `%s` is required', $field));
            }
        }
        if ($data[AdServerConfig::HotWalletMaxValue->name] <= $data[AdServerConfig::HotWalletMinValue->name]) {
            throw new InvalidArgumentException(
                sprintf(
                    'Field `%s` must be greater than `%s`',
                    AdServerConfig::HotWalletMaxValue->name,
                    AdServerConfig::HotWalletMinValue->name
                )
            );
        }

        $this->adServerConfigurationClient->store($input);
        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $input);
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
