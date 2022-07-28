<?php

declare(strict_types=1);

namespace App\Service;

use App\ValueObject\AccountId;
use App\ValueObject\License;
use DateTimeImmutable;
use DateTimeInterface;
use RuntimeException;

class LicenseDecoder
{
    private const METHOD = 'AES-128-CBC';

    public function __construct(private readonly string $licenseKey)
    {
    }

    public function decode(string $encodedLicense): License
    {
        $raw = base64_decode($encodedLicense);

        $ivlen = openssl_cipher_iv_length(self::METHOD);
        $iv = substr($raw, 0, $ivlen);
        $hmac = substr($raw, $ivlen, $sha2len = 32);

        $encrypted = substr($raw, $ivlen + $sha2len);

        $data = openssl_decrypt(
            $encrypted,
            self::METHOD,
            $this->licenseKey,
            OPENSSL_RAW_DATA,
            $iv
        );

        $calcmac = hash_hmac('sha256', $encrypted, $this->licenseKey, true);

        if (!hash_equals($hmac, $calcmac)) {
            throw new RuntimeException(sprintf('Wrong licenseKey (%s).', $this->licenseKey));
        }

        $data = json_decode($data, true);

        return new License(
            $data['type'],
            $data['status'],
            DateTimeImmutable::createFromFormat(DateTimeInterface::ATOM, $data['beginDate']),
            DateTimeImmutable::createFromFormat(DateTimeInterface::ATOM, $data['endDate']),
            $data['owner'],
            new AccountId($data['paymentAddress']),
            $data['paymentMessage'],
            $data['fixedFee'],
            $data['demandFee'],
            $data['supplyFee'],
            $data['privateLabel'] ?? false
        );
    }
}
