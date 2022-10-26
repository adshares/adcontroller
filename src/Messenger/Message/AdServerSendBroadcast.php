<?php

namespace App\Messenger\Message;

final class AdServerSendBroadcast implements AdServerCommand
{
    public function getSignature(): string
    {
        return 'ads:broadcast-host';
    }

    public function getArguments(): array
    {
        return [];
    }
}
