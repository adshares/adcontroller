<?php

namespace App\Messenger\Message;

final class AdServerUpdateTargeting implements AdServerCommand
{
    public function getSignature(): string
    {
        return 'ops:targeting-options:update';
    }
}
