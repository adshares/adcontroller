<?php

namespace App\Messenger\Message;

class AdServerUpdateFiltering extends AdServerCommand
{
    public function __construct() {
        parent::__construct('ops:filtering-options:update');
    }
}
