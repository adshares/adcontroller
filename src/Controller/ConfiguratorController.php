<?php

namespace App\Controller;

use App\Service\AdServerConfigurationClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class ConfiguratorController extends AbstractController
{
    #[Route('/config', name: 'fetch_config', methods: ['GET'])]
    public function fetchConfig(AdServerConfigurationClient $client): JsonResponse
    {
        $data = $client->fetch();
        return $this->jsonOk($data);
    }

    #[Route('/config', name: 'store_config', methods: ['PATCH'])]
    public function storeConfig(AdServerConfigurationClient $client, Request $request): JsonResponse
    {
        $content = json_decode($request->getContent(), true) ?? [];

        // TODO validate

        $client->store($content);

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
