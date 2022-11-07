<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AuthController extends AbstractController
{
    private const OAUTH_AUTHORIZE = '/oauth/authorize';
    private const OAUTH_TOKEN = '/oauth/token';
    private const PANEL_REDIRECT_PATH = '/login';

    public function __construct(
        private readonly string $adServerBaseUri,
        private readonly string $oauthClientId,
        private readonly string $oauthClientSecret,
        private readonly HttpClientInterface $httpClient,
        private readonly RequestStack $requestStack,
    ) {
    }

    #[Route('/oauth/redirect', name: 'oauth_redirect', methods: ['GET'])]
    public function oauthRedirect(Request $request): Response
    {
        $bytes = random_bytes(32);
        $state = substr(base64_encode($bytes), 0, 32);
        $this->requestStack->getSession()->set('state', $state);

        $query = http_build_query([
            'client_id' => $this->oauthClientId,
            'redirect_uri' => $this->getRedirectUri($request),
            'response_type' => 'code',
            'scope' => '',
            'state' => $state,
        ]);

        return new RedirectResponse($this->adServerBaseUri . self::OAUTH_AUTHORIZE . '?' . $query);
    }

    #[Route('/oauth/token', name: 'oauth_token', methods: ['GET'])]
    public function oauthToken(Request $request): Response
    {
        $state = $this->requestStack->getSession()->get('state', '');
        if (strlen($state) > 0 && $state !== $request->get('state')) {
            throw new UnprocessableEntityHttpException('Invalid state');
        }
        $body = [
            'client_id' => $this->oauthClientId,
            'client_secret' => $this->oauthClientSecret,
            'code' => urldecode($request->get('code')),
            'grant_type' => 'authorization_code',
            'redirect_uri' => $this->getRedirectUri($request),
        ];
        $response = $this->httpClient->request('POST', $this->adServerBaseUri . self::OAUTH_TOKEN, ['body' => $body]);

        return new JsonResponse($response->toArray());
    }

    private function getRedirectUri(Request $request): string
    {
        $uri = $request->getUri();
        $path = $request->getPathInfo();
        return substr($uri, 0, strpos($uri, $path)) . self::PANEL_REDIRECT_PATH;
    }
}
