<?php

namespace App\Utility\Validator;

interface Validator
{
    public function valid($value): bool;
}
