<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class Registration implements ConfiguratorCategory
{
    private const ALLOWED_REGISTRATION_MODE = [
        'public',
        'restricted',
        'private',
    ];

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

        foreach (
            [
                AdServerConfig::AutoConfirmationEnabled->name,
                AdServerConfig::AutoRegistrationEnabled->name,
                AdServerConfig::EmailVerificationRequired->name,
            ] as $field
        ) {
            if (isset($input[$field])) {
                if (null === ($value = filter_var($input[$field], FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE))) {
                    throw new UnprocessableEntityHttpException(
                        sprintf('Field `%s` must be a boolean', $field)
                    );
                }

                $input[$field] = $value;
            }
        }

        if (
            isset($input[AdServerConfig::RegistrationMode->name]) &&
            !in_array($input[AdServerConfig::RegistrationMode->name], self::ALLOWED_REGISTRATION_MODE, true)
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf(
                    'Field `%s` must be one of (%s)',
                    AdServerConfig::RegistrationMode->name,
                    join(', ', self::ALLOWED_REGISTRATION_MODE)
                )
            );
        }

        $this->adServerConfigurationClient->store($input);
        $this->repository->insertOrUpdate(AdServerConfig::MODULE, $input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::AutoConfirmationEnabled->name,
            AdServerConfig::AutoRegistrationEnabled->name,
            AdServerConfig::EmailVerificationRequired->name,
            AdServerConfig::RegistrationMode->name,
        ];
    }
}
