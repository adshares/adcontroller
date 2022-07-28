<?php

namespace App\Entity\Enum;

trait GetModule
{
    public function getModule(): string
    {
        return explode('\\', self::class, -1)[0];
    }
}