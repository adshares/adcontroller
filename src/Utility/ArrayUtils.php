<?php

namespace App\Utility;

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
}
