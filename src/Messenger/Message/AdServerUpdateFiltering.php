<?php

namespace App\Messenger\Message;

final class AdServerUpdateFiltering implements AdServerCommand
{
    public function getSignature(): string
    {
        return 'ops:filtering-options:update';
    }

    public function getArguments(): array
    {
        return [];
    }
}
