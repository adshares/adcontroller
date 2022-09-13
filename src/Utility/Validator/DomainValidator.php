<?php

namespace App\Utility\Validator;

class DomainValidator implements Validator
{
    private const DOMAIN_LENGTH_MAX = 255;
    private const DOMAIN_PATTERN = '~^
        (?![.])                                                  # do not allow domains starting with a dot
        ([\pL\pN\pS\-_.])+(\.?([\pL\pN]|xn--[\pL\pN-]+)+\.?)
    $~ixu';

    public function valid($value): bool
    {
        return is_string($value) &&
            strlen($value) <= self::DOMAIN_LENGTH_MAX &&
            1 === preg_match(self::DOMAIN_PATTERN, $value);
    }
}
