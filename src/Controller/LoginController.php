<?php

namespace App\Controller;

use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class LoginController extends AbstractController
{
    #[Route('/api/login', name: 'api_login')]
    public function index(
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
            'http://localhost:8010/auth/jwt/login',
            [
                'json' => ['email' => $email, 'password' => $password],
            ]
        );

        if (Response::HTTP_UNAUTHORIZED === $response->getStatusCode()) {
            throw new UnauthorizedHttpException('RS512', 'Unauthorized');
        }
        if (Response::HTTP_OK !== $response->getStatusCode()) {
            throw new UnprocessableEntityHttpException('Unexpected response from adserver');
        }

        $token = json_decode($response->getContent(), true)['token'];

        $decoded = $tokenEncoder->decode($token);
        $isAdmin = $decoded['admin'] ?? false;

        if (!$isAdmin) {
            throw new AccessDeniedHttpException('Forbidden');
        }

        return $this->json(['token' => $token]);
    }
}
