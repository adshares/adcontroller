<?php

declare(strict_types=1);

namespace App\ValueObject;

enum Role: string
{
    case Admin = 'admin';
    case Advertiser = 'advertiser';
    case Agency = 'agency';
    case Moderator = 'moderator';
    case Publisher = 'publisher';
}
