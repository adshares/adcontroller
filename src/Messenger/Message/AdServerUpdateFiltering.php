<?php

namespace App\Messenger\Message;

final class AdServerUpdateFiltering implements AdServerCommand
{
    public function getSignature(): array
    {
        return ['ops:filtering-options:update'];
    }
}
