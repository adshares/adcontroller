<?php

namespace App\Messenger\Message;

class AdServerUpdateTargeting extends AdServerCommand
{
    public function __construct() {
        parent::__construct('ops:targeting-options:update');
    }
}
