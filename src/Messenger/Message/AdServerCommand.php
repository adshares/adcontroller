<?php

namespace App\Messenger\Message;

interface AdServerCommand
{
    public function getSignature(): string;

    public function getArguments(): array;
}
