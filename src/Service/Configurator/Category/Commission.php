<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;
use App\Utility\Validator\CommissionValidator;

class Commission implements ConfiguratorCategory
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
        ArrayUtils::assureBoolTypeForField($input, AdServerConfig::ReferralRefundEnabled->name);
        self::assureCommissionTypeForFields(
            $input,
            [
                AdServerConfig::OperatorRxFee->name,
                AdServerConfig::OperatorTxFee->name,
                AdServerConfig::ReferralRefundCommission->name,
            ]
        );

        if (
            ($input[AdServerConfig::ReferralRefundEnabled->name] ?? false) &&
            !isset($input[AdServerConfig::ReferralRefundCommission->name]) &&
            null === $this->repository->fetchValueByEnum(AdServerConfig::ReferralRefundCommission)
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` is required', AdServerConfig::ReferralRefundCommission->name)
            );
        }

        $this->adServerConfigurationClient->store($input);
        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::OperatorRxFee->name,
            AdServerConfig::OperatorTxFee->name,
            AdServerConfig::ReferralRefundEnabled->name,
            AdServerConfig::ReferralRefundCommission->name,
        ];
    }

    private static function assureCommissionTypeForFields(array &$input, array $fields): void
    {
        $commissionValidator = new CommissionValidator();
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                if (!$commissionValidator->valid($input[$field])) {
                    throw new InvalidArgumentException(
                        sprintf('Field `%s` must be a commission', $field)
                    );
                }
                $input[$field] = (float)$input[$field];
            }
        }
    }
}
