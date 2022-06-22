<?php

namespace App\ValueObject;

use InvalidArgumentException;

class AccountId
{
    private const PATTERN = '/^[0-9A-F]{4}-[0-9A-F]{8}-([0-9A-F]{4})$/i';

    private string $value;

    public function __construct(string $value)
    {
        if (!self::isValid($value)) {
            throw new InvalidArgumentException('Invalid account address');
        }

        $this->value = strtoupper($value);
    }

    public static function isValid(string $value): bool
    {
        if (1 !== preg_match(self::PATTERN, $value)) {
            return false;
        }

        $checksum = strtoupper(substr($value, -4));

        return $checksum === self::checksum($value);
    }

    private static function checksum(string $value): string
    {
        $nodeId = substr($value, 0, 4);
        $userId = substr($value, 5, 8);

        return sprintf('%04X', self::crc16(sprintf('%04X%08X', hexdec($nodeId), hexdec($userId))));
    }

    private static function crc16(string $hexChars): int
    {
        $chars = hex2bin($hexChars);
        if ($chars) {
            $crc = 0x1D0F;
            for ($i = 0, $iMax = strlen($chars); $i < $iMax; $i++) {
                $x = ($crc >> 8) ^ ord($chars[$i]);
                $x ^= $x >> 4;
                $crc = (($crc << 8) ^ ($x << 12) ^ ($x << 5) ^ $x) & 0xFFFF;
            }
        } else {
            $crc = 0;
        }

        return $crc;
    }

    public function toString(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->toString();
    }
}
