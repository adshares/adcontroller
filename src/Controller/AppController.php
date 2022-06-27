<?php

namespace App\Controller;

use App\Entity\Configuration;
use App\Exception\ServiceNotPresent;
use App\Repository\ConfigurationRepository;
use App\Service\ServicePresenceChecker;
use App\ValueObject\Module;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AppController extends AbstractController
{
    #[Route('/{match_all}', name: 'app', requirements: ['match_all' => '.*'], priority:-1)]
    public function index(ConfigurationRepository $repository, ServicePresenceChecker $servicePresenceChecker): Response
    {
        $state = $repository->fetchValueByName(Configuration::APP_STATE);

        if (null === $state) {
            try {
                $servicePresenceChecker->check(Module::adserver());
            } catch (ServiceNotPresent $exception) {
                return $this->render(
                    'error-page.html.twig',
                    [
                        'message' => sprintf(
                            <<<MESSAGE
Adserver not found (%s).
If you use non-standard location, set ADSERVER_HOME_DIRECTORY in .env file'
MESSAGE
                            ,
                            $exception->getMessage()
                        )
                    ]
                );
            }
        }

        return $this->render('index.html.twig', ['state' => $state]);
    }
}
