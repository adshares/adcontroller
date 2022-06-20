<?php

namespace App\Security;

use App\Exception\JWTInvalidUser;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Authenticator\JWTAuthenticator;
use Symfony\Component\HttpFoundation\Request;

class CustomAuthenticator extends JWTAuthenticator
{
    public function doAuthenticate(Request $request)
    {
        $passport = parent::doAuthenticate($request);

        $payload = $passport->getAttribute('payload');
        $isAdmin = $payload['admin'] ?? false;
        if (!$isAdmin) {
            throw new JWTInvalidUser();
        }

        return $passport;
    }
}
