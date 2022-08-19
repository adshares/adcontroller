<?php

namespace App\Utility\Validator;

use Adshares\Ads\Util\AdsConverter;

class ClickAmountValidator implements Validator
{
    public function valid($value): bool
    {
        return false !== filter_var(
            $value,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 0, 'max_range' => AdsConverter::TOTAL_SUPPLY]],
        );
    }
}
