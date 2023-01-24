<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Exception\OutdatedLicense;
use App\Repository\ConfigurationRepository;
use App\Service\DataCollector;
use App\Service\LicenseReader;
use App\Utility\ArrayUtils;

class License implements ConfiguratorCategory
{
    private const LICENSE_KEY_PATTERN = '/^(COM|SRV)-[\da-z]{6}-[\da-z]{5}-[\da-z]{5}-[\da-z]{4}-[\da-z]{4}$/i';

    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly DataCollector $dataCollector,
        private readonly LicenseReader $licenseReader,
    ) {
    }

    public function process(array $content): array
    {
        $input = ArrayUtils::filterByKeys($content, self::fields());
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }

        $this->validate($input);
        $licenseKey = $input[AdServerConfig::LicenseKey->name];
        try {
            $this->licenseReader->read($licenseKey);
        } catch (OutdatedLicense $exception) {
            throw new InvalidArgumentException($exception->getMessage());
        }

        $this->repository->insertOrUpdateOne(AdServerConfig::LicenseKey, $licenseKey);

        return $this->dataCollector->push($input);
    }

    private function validate(array $input): void
    {
        if (!isset($input[AdServerConfig::LicenseKey->name])) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` is required', AdServerConfig::LicenseKey->name)
            );
        }
        if (!is_string($input[AdServerConfig::LicenseKey->name])) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must be a string', AdServerConfig::LicenseKey->name)
            );
        }
        if (1 !== preg_match(self::LICENSE_KEY_PATTERN, $input[AdServerConfig::LicenseKey->name])) {
            throw new InvalidArgumentException(
                sprintf('Field `%s` must match a license key format', AdServerConfig::LicenseKey->name)
            );
        }
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::LicenseKey->name,
        ];
    }
}
