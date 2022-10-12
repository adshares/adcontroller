<?php

namespace App\Messenger\Message;

final class AdServerFetchExchangeRate implements AdServerCommand
{
    public function getSignature(): string
    {
        return 'ops:exchange-rate:fetch';
    }

    public function getArguments(): array
    {
        return [];
    }
}
