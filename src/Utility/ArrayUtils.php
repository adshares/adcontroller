<?php

namespace App\Utility;

use App\Exception\InvalidArgumentException;
use App\Utility\Validator\PositiveIntegerValidator;

class ArrayUtils
{
    public static function filterByKeys(array $data, array $keys): array
    {
        $filtered = [];
        foreach ($keys as $key) {
            if (isset($data[$key])) {
                $filtered[$key] = $data[$key];
            }
        }
        return $filtered;
    }

    public static function assureBoolTypeForField(array &$input, string $field): void
    {
        if (isset($input[$field])) {
            if (
                null === ($value = filter_var(
                    $input[$field],
                    FILTER_VALIDATE_BOOL,
                    FILTER_NULL_ON_FAILURE
                ))
            ) {
                throw new InvalidArgumentException(
                    sprintf('Field `%s` must be a boolean', $field)
                );
            }

            $input[$field] = $value;
        }
    }

    public static function assurePositiveIntegerTypesForFields(array &$input, array $fields): void
    {
        $validator = new PositiveIntegerValidator();
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                if (!$validator->valid($input[$field])) {
                    throw new InvalidArgumentException(
                        sprintf('Field `%s` must be a positive integer', $field)
                    );
                }

                $input[$field] = (int)$input[$field];
            }
        }
    }
}
