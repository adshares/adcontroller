<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use App\Utility\Validator\DomainValidator;

class RejectedDomains implements ConfiguratorCategory
{
    public function __construct(private readonly DataCollector $dataCollector) {
    }

    public function process(array $content): array
    {
        $fields = self::fields();
        $input = ArrayUtils::filterByKeys($content, $fields);
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }

        if (isset($input[AdServerConfig::RejectedDomains->name])) {
            if (!is_array($input[AdServerConfig::RejectedDomains->name])) {
                throw new InvalidArgumentException(
                    sprintf('Field `%s` must be an array', AdServerConfig::RejectedDomains->name)
                );
            }
            $validator = new DomainValidator();
            foreach ($input[AdServerConfig::RejectedDomains->name] as $item) {
                if (!$validator->valid($item)) {
                    throw new InvalidArgumentException(
                        sprintf('Field `%s` must be a list of domains', AdServerConfig::RejectedDomains->name)
                    );
                }
            }
            $input[AdServerConfig::RejectedDomains->name] = join(',', $input[AdServerConfig::RejectedDomains->name]);
        }

        return $this->dataCollector->push($input);
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::RejectedDomains->name,
        ];
    }
}
