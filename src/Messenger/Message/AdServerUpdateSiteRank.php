<?php

namespace App\Messenger\Message;

final class AdServerUpdateSiteRank implements AdServerCommand
{
    public function getSignature(): array
    {
        return ['ops:supply:site-rank:update', '--all'];
    }
}
