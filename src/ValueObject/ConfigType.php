<?php

namespace App\ValueObject;

enum ConfigType
{
    case Array;
    case Bool;
    case Float;
    case Integer;
    case String;
}
