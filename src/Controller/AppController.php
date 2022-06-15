<?php

namespace App\Controller;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\ServicePresenceChecker;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AppController extends AbstractController
{
    #[Route('/', name: 'app')]
    public function index(ConfigurationRepository $repository, ServicePresenceChecker $servicePresenceChecker): Response
    {
        $state = $repository->findOneByName(Configuration::APP_STATE);

        if (null === $state) {
            $servicePresenceChecker->check('adserver');
        }

        return $this->render('index.html.twig', ['state' => $state]);
    }
}
