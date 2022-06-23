<?php

namespace App\ValueObject;

use InvalidArgumentException;

class Module
{
    private const SUPPORTED_MODULES = [
        'adclassify',
        'adpay',
        'adselect',
        'adserver',
        'aduser',
    ];

    private string $name;

    public function __construct(string $name)
    {
        if (!self::isValid($name)) {
            throw new InvalidArgumentException('Invalid module');
        }

        $this->name = $name;
    }

    public static function adclassify(): self
    {
        return new Module('adclassify');
    }

    public static function adpay(): self
    {
        return new Module('adpay');
    }

    public static function adselect(): self
    {
        return new Module('adselect');
    }

    public static function adserver(): self
    {
        return new Module('adserver');
    }

    public static function aduser(): self
    {
        return new Module('aduser');
    }

    private static function isValid(string $name): bool
    {
        return in_array($name, self::SUPPORTED_MODULES, true);
    }

    public function toString(): string
    {
        return $this->name;
    }

    public function __toString(): string
    {
        return $this->toString();
    }
}
