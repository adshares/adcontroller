<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;
use App\Utility\Validator\AdsAccountValidator;
use App\Utility\Validator\ClickAmountValidator;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

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
            throw new UnprocessableEntityHttpException('Data is required');
        }

        if (isset($input[AdServerConfig::ColdWalletIsActive->name])) {
            if (
                null === filter_var(
                    $input[AdServerConfig::ColdWalletIsActive->name],
                    FILTER_VALIDATE_BOOL,
                    FILTER_NULL_ON_FAILURE
                )
            ) {
                throw new UnprocessableEntityHttpException(
                    sprintf('Field `%s` must be a boolean', AdServerConfig::ColdWalletIsActive->name)
                );
            }
            $isActive = (bool)$input[AdServerConfig::ColdWalletIsActive->name];
            if (!$isActive) {
                $data = [
                    AdServerConfig::ColdWalletIsActive->name => false,
                ];
                $this->adServerConfigurationClient->store($data);
                $this->repository->insertOrUpdate(AdServerConfig::MODULE, $data);
                return;
            }

            $input[AdServerConfig::ColdWalletIsActive->name] = true;
        }

        if (
            isset($input[AdServerConfig::ColdWalletAddress->name]) &&
            !(new AdsAccountValidator())->valid($input[AdServerConfig::ColdWalletAddress->name])
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an ADS account', AdServerConfig::ColdWalletAddress->name)
            );
        }

        $clickAmountValidator = new ClickAmountValidator();
        foreach ([AdServerConfig::HotWalletMaxValue->name, AdServerConfig::HotWalletMinValue->name] as $field) {
            if (isset($input[$field])) {
                if (!$clickAmountValidator->valid($input[$field])) {
                    throw new UnprocessableEntityHttpException(
                        sprintf('Field `%s` must be a click amount', $field)
                    );
                }
                $input[$field] = (int)$input[$field];
            }
        }

        $data = array_merge(
            $this->repository->fetchValuesByNames(AdServerConfig::MODULE, $fields),
            $input,
        );

        foreach ($fields as $field) {
            if (!isset($data[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }
        if ($data[AdServerConfig::HotWalletMaxValue->name] <= $data[AdServerConfig::HotWalletMinValue->name]) {
            throw new UnprocessableEntityHttpException(
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
}
