<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Utility\ArrayUtils;

class Registration implements ConfiguratorCategory
{
    private const ALLOWED_REGISTRATION_MODE = [
        'public',
        'restricted',
        self::REGISTRATION_MODE_PRIVATE,
    ];
    private const REGISTRATION_MODE_PRIVATE = 'private';

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
        foreach (
            [
                AdServerConfig::AutoConfirmationEnabled->name,
                AdServerConfig::AutoRegistrationEnabled->name,
                AdServerConfig::EmailVerificationRequired->name,
            ] as $field
        ) {
            ArrayUtils::assureBoolTypeForField($input, $field);
        }

        if (
            isset($input[AdServerConfig::RegistrationMode->name]) &&
            !in_array($input[AdServerConfig::RegistrationMode->name], self::ALLOWED_REGISTRATION_MODE, true)
        ) {
            throw new InvalidArgumentException(
                sprintf(
                    'Field `%s` must be one of (%s)',
                    AdServerConfig::RegistrationMode->name,
                    join(', ', self::ALLOWED_REGISTRATION_MODE)
                )
            );
        }

        $conflictingSettings = [
            AdServerConfig::AutoRegistrationEnabled->name,
            AdServerConfig::RegistrationMode->name,
        ];
        $data = array_merge(
            $this->repository->fetchValuesByNames(AdServerConfig::MODULE, $conflictingSettings),
            $input,
        );
        foreach ($conflictingSettings as $field) {
            if (!isset($data[$field])) {
                throw new InvalidArgumentException(
                    sprintf('Field `%s` is required', $field)
                );
            }
            if (
                $data[AdServerConfig::AutoRegistrationEnabled->name] &&
                self::REGISTRATION_MODE_PRIVATE === $data[AdServerConfig::RegistrationMode->name]
            ) {
                throw new InvalidArgumentException('Automatic registration is forbidden in private mode');
            }
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
