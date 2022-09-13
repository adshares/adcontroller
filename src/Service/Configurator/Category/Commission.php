<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use App\Utility\Validator\CommissionValidator;

class Commission implements ConfiguratorCategory
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
        if (
            array_key_exists(AdServerConfig::ReferralRefundEnabled->name, $input) &&
            null === $input[AdServerConfig::ReferralRefundEnabled->name]
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must be a boolean', AdServerConfig::ReferralRefundEnabled->name)
            );
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
            !array_key_exists(AdServerConfig::ReferralRefundCommission->name, $input) &&
            null === $this->repository->fetchValueByEnum(AdServerConfig::ReferralRefundCommission)
        ) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` is required', AdServerConfig::ReferralRefundCommission->name)
            );
        }

        return $this->dataCollector->push($input);
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
