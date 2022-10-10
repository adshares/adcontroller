<?php

namespace App\Messenger\Message;

class AdServerCommand
{
    public function __construct(private readonly string $signature) {
    }

    public function getSignature(): string
    {
        return $this->signature;
    }
}
