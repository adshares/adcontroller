<?php

namespace App\Utility\Validator;

use App\ValueObject\AccountId;

class AdsAccountValidator implements Validator
{
    public function valid($value): bool
    {
        return is_string($value) && AccountId::isValid($value);
    }
}
