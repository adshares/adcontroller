<?php

namespace App\Messenger\Message;

class AdServerFetchExchangeRate extends AdServerCommand
{
    public function __construct() {
        parent::__construct('ops:exchange-rate:fetch');
    }
}
