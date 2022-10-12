<?php

namespace App\Messenger\Message;

interface AdServerCommand
{
    public function getSignature(): array;
}
