<?php

namespace App\Controller;

use App\Entity\Enum\App;
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
            $servicePresenceChecker->check(Module::adserver());
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

        if (null === ($state = $repository->fetchValueByEnum(App::APP_STATE))) {
            if ($accountList->isAdministratorAccountPresent()) {
                $state = AppStateEnum::ADSERVER_ACCOUNT_CREATED->value;
                $repository->insertOrUpdateOne(App::APP_STATE, $state);
            }
        }

        return $this->render('index.html.twig', ['state' => AppStateEnum::tryFrom($state)]);
    }
}
