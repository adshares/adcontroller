<?php

namespace App\Controller;

use App\Entity\Enum\AppConfig;
use App\Entity\Enum\AppStateEnum;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerAdminCreator;
use App\Service\AdServerOAuthClientRegistrar;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Exception\RuntimeException as ProcessRuntimeException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AccountController extends AbstractController
{
    #[Route('/api/accounts', name: 'api_accounts_create', methods: ['POST'])]
    public function createAccount(
        Request $request,
        AdServerAdminCreator $accountCreator,
        AdServerOAuthClientRegistrar $clientRegistrar,
        ConfigurationRepository $repository,
        ValidatorInterface $validator,
    ): JsonResponse {
        if (null !== $repository->fetchValueByEnum(AppConfig::AppState)) {
            throw new UnprocessableEntityHttpException('Account already created');
        }
        $content = json_decode($request->getContent(), true);

        $constraints = new Assert\Collection(
            [
                'email' => [
                    new Assert\NotBlank(['message' => 'Field `email` should not be blank']),
                    new Assert\Email(['message' => 'Field `email` should be an e-mail']),
                ],
                'password' => [
                    new Assert\NotBlank(['message' => 'Field `password` should not be blank']),
                ],
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

        try {
            $clientRegistrar->register($this->getRedirectUri());
            $accountCreator->create($email, $password);
        } catch (ProcessFailedException | ProcessRuntimeException) {
            throw new UnprocessableEntityHttpException('Account cannot be created');
        }
        $repository->insertOrUpdateOne(AppConfig::AppState, AppStateEnum::AdserverAccountCreated->name);

        return $this->json(['message' => sprintf('Account %s created', $email)], Response::HTTP_CREATED);
    }

    #[Route('/api/check', name: 'api_check', methods: ['GET'])]
    public function check(JWTTokenManagerInterface $jwtManager, Request $request): Response
    {
        $accessToken = $request->getSession()->get('accessToken');
        $payload = $jwtManager->parse($accessToken);
        $data = [
            'name' => $payload['username'] ?? 'N/A',
            'roles' => $payload['roles'] ?? [],
        ];

        return parent::json([
            'message' => 'OK',
            'code' => Response::HTTP_OK,
            'data' => $data,
        ]);
    }

    private function getRedirectUri(): string
    {
        return $this->generateUrl('oauth_callback', [], UrlGeneratorInterface::ABSOLUTE_URL);
    }
}
