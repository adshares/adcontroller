<?php

namespace App\Controller;

use App\Entity\Enum\AppConfig;
use App\Entity\Enum\AppStateEnum;
use App\Exception\ServiceNotPresent;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerAdminList;
use App\Service\ServicePresenceChecker;
use App\ValueObject\Module;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AppController extends AbstractController
{
    #[Route('/{match_all}', name: 'app', requirements: ['match_all' => '^(?!api).*$'], priority: -1)]
    public function index(
        AdServerAdminList $accountList,
        ConfigurationRepository $repository,
        LoggerInterface $logger,
        ServicePresenceChecker $servicePresenceChecker
    ): Response {
        try {
            $servicePresenceChecker->check(Module::AdServer);
        } catch (ServiceNotPresent $exception) {
            $errorMessage = sprintf(
                <<<MESSAGE
Adserver not found (%s).
If you use non-standard location, set ADSERVER_HOME_DIRECTORY in .env file'
MESSAGE
                ,
                $exception->getMessage()
            );
            $logger->emergency($errorMessage);
            return $this->render(
                'error-page.html.twig',
                [
                    'message' => $errorMessage
                ]
            );
        }

        if (null === ($state = $repository->fetchValueByEnum(AppConfig::AppState))) {
            if ($accountList->isAdministratorAccountPresent()) {
                $state = AppStateEnum::AdserverAccountCreated->name;
                $repository->insertOrUpdateOne(AppConfig::AppState, $state);
            }
        }

        return $this->render('index.html.twig', ['state' => AppStateEnum::tryFrom($state)]);
    }
}
