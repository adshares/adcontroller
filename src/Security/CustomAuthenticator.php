<?php

namespace App\Security;

use App\Exception\JWTInvalidUser;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Authenticator\JWTAuthenticator;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

class CustomAuthenticator extends JWTAuthenticator
{
    /**
     * @return Passport
     */
    public function doAuthenticate(Request $request) /*: Passport */
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
