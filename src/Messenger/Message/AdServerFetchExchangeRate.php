<?php

namespace App\Messenger\Message;

final class AdServerFetchExchangeRate implements AdServerCommand
{
    public function getSignature(): array
    {
        return ['ops:exchange-rate:fetch'];
    }
}
