<?php

namespace App\Controller;

use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTDecodeFailureException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class LoginController extends AbstractController
{
    private const ADSERVER_LOG_IN_URI = '/auth/jwt/login';
    private const ADSERVER_LOG_OUT_URI = '/auth/jwt/logout';

    public function __construct(private readonly LoggerInterface $logger, private readonly string $adServerBaseUri)
    {
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function logIn(
        Request $request,
        HttpClientInterface $httpClient,
        JWTEncoderInterface $tokenEncoder,
        ValidatorInterface $validator
    ): JsonResponse {
        $content = json_decode($request->getContent(), true);

        $constraints = new Assert\Collection(
            [
                'email' => [
                    new Assert\NotBlank(['message' => 'Field `email` should not be blank']),
                    new Assert\Email(['message' => 'Field `email` should be an e-mail']),
                ],
                'password' => new Assert\NotBlank(['message' => 'Field `password` should not be blank']),
            ],
            null,
            null,
            false,
            false,
            'Only fields `email` and `password` are allowed',
            'Fields `email` and `password` are required'
        );
        $errors = $validator->validate($content, $constraints);
        if (0 !== count($errors)) {
            $errorMessage = $errors[0]->getMessage();
            throw new UnprocessableEntityHttpException($errorMessage);
        }

        $email = $content['email'];
        $password = $content['password'];

        $response = $httpClient->request(
            'POST',
            $this->adServerBaseUri . self::ADSERVER_LOG_IN_URI,
            [
                'json' => ['email' => $email, 'password' => $password],
            ]
        );
        $statusCode = $this->checkStatusCode($response);

        if (Response::HTTP_UNAUTHORIZED === $statusCode) {
            throw new UnauthorizedHttpException('RS512', 'Unauthorized');
        }
        if (Response::HTTP_OK !== $statusCode) {
            throw new UnprocessableEntityHttpException(
                sprintf('Unexpected response from adserver (%d)', $statusCode)
            );
        }

        $token = json_decode($response->getContent(), true)['token'];

        try {
            $decoded = $tokenEncoder->decode($token);
        } catch (JWTDecodeFailureException $exception) {
            $this->logger->error(sprintf('Authentication token was not decoded (%s)', $exception->getMessage()));
            throw new HttpException(Response::HTTP_INTERNAL_SERVER_ERROR, 'JWT token cannot be decoded');
        }
        $isAdmin = $decoded['admin'] ?? false;

        if (!$isAdmin) {
            throw new AccessDeniedHttpException('Forbidden');
        }

        return $this->json(['token' => $token]);
    }

    #[Route('/api/logout', name: 'api_logout')]
    public function logOut(Request $request, HttpClientInterface $httpClient): JsonResponse
    {
        $response = $httpClient->request(
            'POST',
            $this->adServerBaseUri . self::ADSERVER_LOG_OUT_URI,
            [
                'headers' => [
                    'Authorization' => $request->headers->get('Authorization'),
                ],
            ]
        );
        $statusCode = $this->checkStatusCode($response);

        if (Response::HTTP_OK !== $statusCode) {
            throw new UnprocessableEntityHttpException(
                sprintf('User log out failed. Error (%d)', $statusCode)
            );
        }

        return $this->json(['message' => 'User logged out successfully']);
    }

    private function checkStatusCode(ResponseInterface $response): int
    {
        try {
            $statusCode = $response->getStatusCode();
        } catch (TransportExceptionInterface $exception) {
            $this->logger->critical(sprintf('AdServer does not respond: %s', $exception->getMessage()));
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, 'AdServer does not respond');
        }

        return $statusCode;
    }
}
