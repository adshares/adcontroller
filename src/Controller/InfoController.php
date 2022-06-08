<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class InfoController extends AbstractController
{
    #[Route(['/info', '/info.json'], name: 'app_info')]
    public function index(string $appName, string $appVersion): JsonResponse
    {
        return $this->json([
            'module' => 'adcontroller',
            'name' => $appName,
            'version' => $appVersion,
        ]);
    }
}
