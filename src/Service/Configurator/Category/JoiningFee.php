<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class JoiningFee implements ConfiguratorCategory
{
    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly DataCollector $dataCollector
    ) {
    }

    public function process(array $content): array
    {
        $input = ArrayUtils::filterByKeys($content, self::fields());
        if (empty($input)) {
            throw new UnprocessableEntityHttpException('Data is required');
        }
        foreach (self::fields() as $field) {
            if (!isset($input[$field])) {
                throw new InvalidArgumentException(sprintf('Field `%s` is required', $field));
            }
        }

        ArrayUtils::assureBoolTypeForField($input, AdServerConfig::JoiningFeeEnabled->name);
        ArrayUtils::assurePositiveIntegerTypesForFields(
            $input,
            [AdServerConfig::JoiningFeeValue->name],
        );
        $this->validateJoiningFeeValue($input[AdServerConfig::JoiningFeeValue->name]);

        return $this->dataCollector->push($input);
    }

    private function validateJoiningFeeValue(int $feeValue): void
    {
        $minimumFeeValue = $this->repository->fetchValueByEnum(AdServerConfig::JoiningFeeMinValue) ?? 0;
        if ($feeValue < $minimumFeeValue) {
            throw new InvalidArgumentException(
                sprintf(
                    'Field `%s` cannot be lower than %s clicks',
                    AdServerConfig::JoiningFeeValue->name,
                    $minimumFeeValue,
                )
            );
        }
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::JoiningFeeEnabled->name,
            AdServerConfig::JoiningFeeValue->name,
        ];
    }
}
