<?php

namespace App\Messenger\Message;

final class AdServerUpdateSiteRank implements AdServerCommand
{
    public function getSignature(): string
    {
        return 'ops:supply:site-rank:update';
    }

    public function getArguments(): array
    {
        return ['--all'];
    }
}
