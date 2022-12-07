<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use App\ValueObject\Role;

class Registration implements ConfiguratorCategory
{
    private const ALLOWED_REGISTRATION_MODE = [
        'public',
        'restricted',
        self::REGISTRATION_MODE_PRIVATE,
    ];
    private const REGISTRATION_MODE_PRIVATE = 'private';

    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly DataCollector $dataCollector,
    ) {
    }

    public function process(array $content): array
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

        foreach (
            [
                AdServerConfig::AdvertiserApplyFormUrl->name,
                AdServerConfig::PublisherApplyFormUrl->name,
            ] as $field
        ) {
            if (
                isset($input[$field]) &&
                false === filter_var($input[$field], FILTER_VALIDATE_URL)
            ) {
                throw new InvalidArgumentException(sprintf('Field `%s` must be an url', $field));
            }
        }

        if (isset($input[AdServerConfig::DefaultUserRoles->name])) {
            if (!is_array($input[AdServerConfig::DefaultUserRoles->name])) {
                throw new InvalidArgumentException(
                    sprintf('Field `%s` must be an array', AdServerConfig::DefaultUserRoles->name)
                );
            }
            if (0 === count($input[AdServerConfig::DefaultUserRoles->name])) {
                throw new InvalidArgumentException(
                    sprintf('Field `%s` must be a non-empty array', AdServerConfig::DefaultUserRoles->name)
                );
            }
            $input[AdServerConfig::DefaultUserRoles->name] =
                array_unique($input[AdServerConfig::DefaultUserRoles->name]);
            foreach ($input[AdServerConfig::DefaultUserRoles->name] as $item) {
                if (!in_array($item, [Role::Advertiser->value, Role::Publisher->value], true)) {
                    throw new InvalidArgumentException(
                        sprintf('Field `%s` must be a list of roles', AdServerConfig::DefaultUserRoles->name)
                    );
                }
            }
            $input[AdServerConfig::DefaultUserRoles->name] = join(',', $input[AdServerConfig::DefaultUserRoles->name]);
        }

        if (
            array_key_exists(AdServerConfig::RegistrationMode->name, $input) &&
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
                throw new InvalidArgumentException(sprintf('Field `%s` is required', $field));
            }
            if (
                $data[AdServerConfig::AutoRegistrationEnabled->name] &&
                self::REGISTRATION_MODE_PRIVATE === $data[AdServerConfig::RegistrationMode->name]
            ) {
                throw new InvalidArgumentException('Automatic registration is forbidden in private mode');
            }
        }

        return $this->dataCollector->push($input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::AdvertiserApplyFormUrl->name,
            AdServerConfig::AutoConfirmationEnabled->name,
            AdServerConfig::AutoRegistrationEnabled->name,
            AdServerConfig::DefaultUserRoles->name,
            AdServerConfig::EmailVerificationRequired->name,
            AdServerConfig::PublisherApplyFormUrl->name,
            AdServerConfig::RegistrationMode->name,
        ];
    }
}
