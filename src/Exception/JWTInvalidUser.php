<?php

namespace App\Exception;

use Symfony\Component\Security\Core\Exception\AuthenticationException;

class JWTInvalidUser extends AuthenticationException
{
    public function getMessageKey(): string
    {
        return 'User does not have administrator rights';
    }
}
