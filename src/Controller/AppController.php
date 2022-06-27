<?php

namespace App\Controller;

use App\Entity\Configuration;
use App\Exception\ServiceNotPresent;
use App\Repository\ConfigurationRepository;
use App\Service\AdserverAdminList;
use App\Service\ServicePresenceChecker;
use App\ValueObject\Module;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AppController extends AbstractController
{
    #[Route('/{match_all}', name: 'app', requirements: ['match_all' => '.*'], priority: -1)]
    public function index(
        AdserverAdminList $accountList,
        ConfigurationRepository $repository,
        ServicePresenceChecker $servicePresenceChecker
    ): Response {
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

        if (null === ($state = $repository->fetchValueByName(Configuration::APP_STATE))) {
            if ($accountList->isAdministratorAccountPresent()) {
                $state = Configuration::APP_STATE_ADSERVER_ACCOUNT_CREATED;
                $repository->insertOrUpdateOne(
                    Configuration::APP_STATE,
                    Configuration::APP_STATE_ADSERVER_ACCOUNT_CREATED
                );
            }
        }

        return $this->render('index.html.twig', ['state' => $state]);
    }
}
