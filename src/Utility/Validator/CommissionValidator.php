<?php

namespace App\Utility\Validator;

class CommissionValidator implements Validator
{
    public function valid($value): bool
    {
        return false !== filter_var(
            $value,
            FILTER_VALIDATE_FLOAT,
            ['options' => ['min_range' => 0, 'max_range' => 1]]
        );
    }
}
