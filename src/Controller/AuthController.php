<?php

namespace App\Controller;

use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\AppConfig;
use App\Repository\ConfigurationRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AuthController extends AbstractController
{
    private const DEFAULT_REDIRECT = '/';
    private const OAUTH_AUTHORIZE = '/auth/authorize';
    private const OAUTH_TOKEN = '/oauth/token';

    public function __construct(
        private readonly string $adServerBaseUri,
        private readonly ConfigurationRepository $repository,
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

        if ($referer = $request->headers->get('Referer')) {
            $this->requestStack->getSession()->set('referer', $referer);
        }

        $clientId = $this->repository->fetchValueByEnum(AppConfig::OAuthClientId);
        $query = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $this->getRedirectUri(),
            'response_type' => 'code',
            'scope' => '',
            'state' => $state,
        ]);

        return new RedirectResponse($this->adServerBaseUri . self::OAUTH_AUTHORIZE . '?' . $query);
    }

    #[Route('/oauth/callback', name: 'oauth_callback', methods: ['GET'])]
    public function oauthCallback(Request $request): Response
    {
        $state = $this->requestStack->getSession()->get('state', '');
        if (strlen($state) > 0 && $state !== $request->get('state')) {
            throw new UnprocessableEntityHttpException('Invalid state');
        }
        $credentials = $this->repository->fetchValuesByNames(
            AppConfig::MODULE,
            [AppConfig::OAuthClientId->name, AppConfig::OAuthClientSecret->name],
            true
        );
        $body = [
            'client_id' => $credentials[AppConfig::OAuthClientId->name],
            'client_secret' => $credentials[AppConfig::OAuthClientSecret->name],
            'code' => urldecode($request->get('code')),
            'grant_type' => 'authorization_code',
            'redirect_uri' => $this->getRedirectUri(),
        ];
        $response = $this->httpClient->request('POST', $this->adServerBaseUri . self::OAUTH_TOKEN, ['body' => $body]);
        $accessToken = $response->toArray()['access_token'];
        $this->requestStack->getSession()->set('accessToken', $accessToken);

        $referer = $this->requestStack->getSession()->get('referer') ?? self::DEFAULT_REDIRECT;
        return new RedirectResponse($referer);
    }

    #[Route('/oauth/logout', name: 'oauth_logout', methods: ['GET'])]
    public function oauthLogout(
        ConfigurationRepository $configurationRepository,
        JWTTokenManagerInterface $jwtManager,
        Request $request,
    ): Response {
//        $accessToken = $this->requestStack->getSession()->get('accessToken');
//        $payload = $jwtManager->parse($accessToken);

        $this->requestStack->getSession()->invalidate();
        $url = $configurationRepository->fetchValueByEnum(AdPanelConfig::Url) ?? $request->getSchemeAndHttpHost();
        return new RedirectResponse($url);
    }

    private function getRedirectUri(): string
    {
        return $this->generateUrl('oauth_callback', [], UrlGeneratorInterface::ABSOLUTE_URL);
    }
}
