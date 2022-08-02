<?php

namespace App\Service;

use App\Exception\CryptException;

class Crypt
{
    private const CIPHER_ALGORITHM = 'aes-256-gcm';

    public function __construct(private readonly string $appSecret)
    {
    }

    public function decrypt(string $ciphertext): string
    {
        $payload = json_decode(base64_decode($ciphertext), true);

        $iv = base64_decode($payload['iv']);
        $tag = base64_decode($payload['tag']);
        $decrypted = openssl_decrypt($payload['value'], self::CIPHER_ALGORITHM, $this->appSecret, 0, $iv, $tag);
        if (false === $decrypted) {
            throw new CryptException('Decryption failed');
        }

        return $decrypted;
    }

    public function encrypt(string $message): string
    {
        $initializationVector = random_bytes(openssl_cipher_iv_length(self::CIPHER_ALGORITHM));
        $value = openssl_encrypt($message, self::CIPHER_ALGORITHM, $this->appSecret, 0, $initializationVector, $tag);

        if (false === $value) {
            throw new CryptException('Encryption failed');
        }

        $iv = base64_encode($initializationVector);
        $tag = base64_encode($tag ?? '');

        $json = json_encode(compact('iv', 'value', 'tag'), JSON_UNESCAPED_SLASHES);

        return base64_encode($json);
    }
}
