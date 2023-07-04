<?php

namespace App\Messenger\Message;

final class AdServerReloadDefaultSupplyPlaceholders implements AdServerCommand
{
    public function getSignature(): string
    {
        return 'ops:supply:default-placeholders:reload';
    }

    public function getArguments(): array
    {
        return [];
    }
}
