<?php

namespace App\Controller;

use Doctrine\Persistence\ManagerRegistry;
use RuntimeException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ModuleController extends AbstractController
{
    private const SUPPORTED_MODULES = [
        'adclassify',
        'adpay',
        'adselect',
        'adserver',
        'aduser',
    ];

    private HttpClientInterface $client;

    public function __construct(HttpClientInterface $client)
    {
        $this->client = $client;
    }

    #[Route('/api/module', name: 'create_module', methods: ['GET'])]
    public function createProduct(): Response
    {
        return new Response('OK');
    }
}
