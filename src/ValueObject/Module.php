<?php

namespace App\ValueObject;

enum Module
{
    case AdClassify;
    case AdPanel;
    case AdPay;
    case AdSelect;
    case AdServer;
    case AdUser;

    public function getInfoName(): string
    {
        if (self::AdPanel === $this) {
            return 'adserver-user-panel';
        }

        return strtolower($this->name);
    }

    public function toLowerCase(): string
    {
        return strtolower($this->name);
    }
}
