<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;
use App\Utility\Validator\PositiveIntegerValidator;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class AutomaticWithdrawal implements ConfiguratorCategory
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

        $validator = new PositiveIntegerValidator();
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                if (!$validator->valid($input[$field])) {
                    throw new UnprocessableEntityHttpException(
                        sprintf('Field `%s` must be a positive integer', $field)
                    );
                }

                $input[$field] = (int)$input[$field];
            }
        }

        $this->adServerConfigurationClient->store($input);
        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::AutoWithdrawalLimitAds->name,
            AdServerConfig::AutoWithdrawalLimitBsc->name,
            AdServerConfig::AutoWithdrawalLimitBtc->name,
            AdServerConfig::AutoWithdrawalLimitEth->name,
        ];
    }
}
