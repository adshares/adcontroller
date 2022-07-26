<?php

namespace App\Controller;

use App\Exception\ServiceNotPresent;
use App\Exception\UnexpectedResponseException;
use App\Service\AdServerConfigurationClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class ConfiguratorController extends AbstractController
{
    #[Route('/config', name: 'fetch_config', methods: ['GET'])]
    public function fetchConfig(AdServerConfigurationClient $client): JsonResponse
    {
        try {
            $data = $client->fetch();
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }

        return $this->jsonOk($data);
    }

    #[Route('/config', name: 'store_config', methods: ['PATCH'])]
    public function storeConfig(AdServerConfigurationClient $client, Request $request): JsonResponse
    {
        $content = json_decode($request->getContent(), true) ?? [];

        // TODO validate

        try {
            $client->store($content);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }

        return $this->jsonOk();
    }

    protected function jsonOk(array $data = []): JsonResponse
    {
        return parent::json([
            'message' => 'OK',
            'code' => Response::HTTP_OK,
            'data' => $data,
        ]);
    }
}
