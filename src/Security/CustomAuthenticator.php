<?php

namespace App\Security;

use App\Exception\JWTInvalidUser;
use App\ValueObject\Role;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Authenticator\JWTAuthenticator;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

class CustomAuthenticator extends JWTAuthenticator
{
    public function doAuthenticate(Request $request): Passport
    {
        $passport = parent::doAuthenticate($request);

        $payload = $passport->getAttribute('payload');
        $roles = $payload['roles'] ?? [];
        if (!in_array(Role::Admin->value, $roles, true)) {
            throw new JWTInvalidUser();
        }

        return $passport;
    }
}
