<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;
use App\Utility\Validator\CommissionValidator;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

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
            throw new UnprocessableEntityHttpException('Data is required');
        }

        if (isset($input[AdServerConfig::ReferralRefundEnabled->name])) {
            if (
                null === ($value = filter_var(
                    $input[AdServerConfig::ReferralRefundEnabled->name],
                    FILTER_VALIDATE_BOOL,
                    FILTER_NULL_ON_FAILURE
                ))
            ) {
                throw new UnprocessableEntityHttpException(
                    sprintf('Field `%s` must be a boolean', AdServerConfig::ReferralRefundEnabled->name)
                );
            }

            $input[AdServerConfig::ReferralRefundEnabled->name] = $value;
        }

        $commissionValidator = new CommissionValidator();
        foreach (
            [
                AdServerConfig::OperatorRxFee->name,
                AdServerConfig::OperatorTxFee->name,
                AdServerConfig::ReferralRefundCommission->name,
            ] as $field
        ) {
            if (isset($input[$field])) {
                if (!$commissionValidator->valid($input[$field])) {
                    throw new UnprocessableEntityHttpException(
                        sprintf('Field `%s` must be a commission', $field)
                    );
                }
                $input[$field] = (float)$input[$field];
            }
        }

        if (
            ($input[AdServerConfig::ReferralRefundEnabled->name] ?? false) &&
            !isset($input[AdServerConfig::ReferralRefundCommission->name]) &&
            null === $this->repository->fetchValueByEnum(AdServerConfig::ReferralRefundCommission)
        ) {
            throw new UnprocessableEntityHttpException(
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
}
