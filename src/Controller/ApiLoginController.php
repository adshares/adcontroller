<?php

namespace App\Controller;

use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api', name: 'api_')]
class ApiLoginController extends AbstractController
{
    #[Route('/login', name: 'login')]
    public function index(
        Request $request,
        HttpClientInterface $httpClient,
        JWTEncoderInterface $tokenEncoder,
        ValidatorInterface $validator
    ): JsonResponse {
        $email = $request->get('email');
        $password = $request->get('password');

        $constraints = new Assert\Collection([
            'email' => [
                new Assert\NotBlank(['message' => 'Field `email` should not be blank']),
                new Assert\Email(['message' => 'Field `email` should be an e-mail']),
            ],
            'password' => new Assert\NotBlank(['message' => 'Field `password` should not be blank']),
        ]);
        $errors = $validator->validate(['email' => $email, 'password' => $password], $constraints);
        if (0 !== count($errors)) {
            $errorMessage = $errors[0]->getMessage();
            throw new UnprocessableEntityHttpException($errorMessage);
        }

        $response = $httpClient->request(
            'POST',
            'http://localhost:8010/auth/jwt/login',
            [
                'json' => ['email' => $email, 'password' => $password],
            ]
        );

        if (Response::HTTP_UNAUTHORIZED === $response->getStatusCode()) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        if (Response::HTTP_OK !== $response->getStatusCode()) {
            throw new UnprocessableEntityHttpException('Unexpected response from adserver');
        }

        $token = json_decode($response->getContent(), true)['token'];

        $decoded = $tokenEncoder->decode($token);
        $isAdmin = $decoded['admin'] ?? false;

        if (!$isAdmin) {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        return $this->json(['token' => $token]);
    }
}
