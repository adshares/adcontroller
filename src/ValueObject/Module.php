<?php

namespace App\ValueObject;

use InvalidArgumentException;

class Module
{
    public const ADCLASSIFY = 'adclassify';
    public const ADPANEL = 'adpanel';
    public const ADPAY = 'adpay';
    public const ADSELECT = 'adselect';
    public const ADSERVER = 'adserver';
    public const ADUSER = 'aduser';
    private const SUPPORTED_MODULES = [
        self::ADCLASSIFY,
        self::ADPANEL,
        self::ADPAY,
        self::ADSELECT,
        self::ADSERVER,
        self::ADUSER,
    ];

    private string $name;

    private function __construct(string $name)
    {
        if (!self::isValid($name)) {
            throw new InvalidArgumentException('Invalid module');
        }

        $this->name = $name;
    }

    public static function fromName(string $name): self
    {
        return new Module($name);
    }

    public static function adclassify(): self
    {
        return new Module(self::ADCLASSIFY);
    }

    public static function adpanel(): self
    {
        return new Module(self::ADPANEL);
    }

    public static function adpay(): self
    {
        return new Module(self::ADPAY);
    }

    public static function adselect(): self
    {
        return new Module(self::ADSELECT);
    }

    public static function adserver(): self
    {
        return new Module(self::ADSERVER);
    }

    public static function aduser(): self
    {
        return new Module(self::ADUSER);
    }

    private static function isValid(string $name): bool
    {
        return in_array($name, self::SUPPORTED_MODULES, true);
    }

    public function getDisplayableName(): string
    {
        return implode(
            '',
            array_map(
                fn($part) => ucfirst($part),
                [substr($this->name, 0, 2), substr($this->name, 2)]
            )
        );
    }

    public function getInfoName(): string
    {
        if (self::ADPANEL === $this->name) {
            return 'adserver-user-panel';
        }

        return $this->name;
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
