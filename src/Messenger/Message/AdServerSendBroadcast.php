<?php

namespace App\Messenger\Message;

final class AdServerSendBroadcast implements AdServerCommand
{
    public function getSignature(): array
    {
        return ['ads:broadcast-host'];
    }
}
