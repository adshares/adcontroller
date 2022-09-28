<?php

namespace App\Service\Configurator\Category;

use App\Exception\InvalidArgumentException;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;

abstract class PlaceholdersConfigurator implements ConfiguratorCategory
{
    private const MAXIMUM_CONTENT_LENGTH = 16777210;

    public function __construct(private readonly DataCollector $dataCollector)
    {
    }

    public function process(array $content): array
    {
        $fields = $this->fields();
        $input = ArrayUtils::filterByKeys($content, $fields);
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }

        foreach ($fields as $field) {
            if (
                isset($input[$field]) &&
                (!is_string($input[$field]) || strlen($input[$field]) > self::MAXIMUM_CONTENT_LENGTH)
            ) {
                throw new InvalidArgumentException(sprintf('Field `%s` must be a string', $field));
            }
        }

        return $this->dataCollector->pushPlaceholders($input);
    }

    abstract protected function fields(): array;
}
