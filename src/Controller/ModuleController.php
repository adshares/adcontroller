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
    public function createProduct(ManagerRegistry $doctrine, Request $request): Response
    {
//        if (!in_array(($module = $request->get('module')), self::SUPPORTED_MODULES, true)) {
//            throw new UnprocessableEntityHttpException(sprintf('Invalid module: %s', $module));
//        }
//        if (!is_string($name = $request->get('name'))) {
//            throw new UnprocessableEntityHttpException('Field `name` must be a string.');
//        }
//        if (strlen($name) <= 0 || strlen($name) > 31) {
//            throw new UnprocessableEntityHttpException('Field `name` cannot be longer than 31 characters.');
//        }
//        if (filter_var($url = $request->get('url'))) {
//            throw new UnprocessableEntityHttpException('Field `name` cannot be longer than 31 characters.');
//        }

        $entityManager = $doctrine->getManager();

//        $product = new Module();
//        $product->setModule($module);
//        $product->setName($name);
//        $product->setUrl();

//        $entityManager->persist($product);
//        $entityManager->flush();

//        return new Response('Saved new product with id '.$product->getId());
        return new Response('OK');
    }

    #[Route('/module/{module}', name: 'net_module')]
    public function module(string $module): JsonResponse
    {
        $response = $this->client->request('GET', 'http://localhost:8010/info.json');
        if (null === ($data = json_decode($response->getContent(), true))) {
            throw new RuntimeException('Invalid format');
        }

        return $this->json($data);
    }
}
