<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdClassify;
use App\Entity\Enum\AdPanel;
use App\Entity\Enum\AdPay;
use App\Entity\Enum\AdSelect;
use App\Entity\Enum\AdServer;
use App\Entity\Enum\AdUser;
use App\Entity\Enum\App;
use App\Entity\Enum\AppStateEnum;
use App\Entity\Enum\InstallerStepEnum;
use App\Repository\ConfigurationRepository;
use App\ValueObject\Module;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class StatusStep implements InstallerStep
{
    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly HttpClientInterface $httpClient
    ) {
    }

    public function process(array $content): void
    {
        $this->repository->insertOrUpdate(
            App::MODULE,
            [
                App::INSTALLER_STEP->value => $this->getName(),
                App::APP_STATE->value => AppStateEnum::INSTALLATION_COMPLETED->value,
            ]
        );
    }

    public function getName(): string
    {
        return InstallerStepEnum::STATUS->value;
    }

    public function fetchData(): array
    {
        $config = [
            Module::ADCLASSIFY => AdClassify::URL,
            Module::ADPANEL => AdPanel::URL,
            Module::ADPAY => AdPay::URL,
            Module::ADSELECT => AdSelect::URL,
            Module::ADSERVER => AdServer::URL,
            Module::ADUSER => AdUser::URL,
        ];

        $data = [
            Configuration::COMMON_DATA_REQUIRED => $this->isDataRequired(),
        ];
        foreach ($config as $moduleName => $enum) {
            $url = $this->repository->fetchValueByEnum($enum);
            $data[$moduleName] = $this->getModuleStatus(Module::fromName($moduleName), $url);
        }

        return $data;
    }

    private function getModuleStatus(Module $module, ?string $url): array
    {
        $data = [
            'module' => $module->getDisplayableName(),
            'version' => '#',
            'url' => $url,
            'code' => Response::HTTP_PRECONDITION_FAILED,
        ];

        if (!$url) {
            return $data;
        }

        $version = '#';
        try {
            $response = $this->httpClient->request('GET', $url . '/info.json');
            $body = json_decode($response->getContent());
            $infoModule = $body->module ?? null;
            if ($module->getInfoName() !== $infoModule) {
                $status = Response::HTTP_NOT_IMPLEMENTED;
            } else {
                $status = $response->getStatusCode();
                $version = $body->version ?? '#';
            }
        } catch (
            ClientExceptionInterface |
            RedirectionExceptionInterface |
            ServerExceptionInterface |
            TransportExceptionInterface
        ) {
            $status = Response::HTTP_BAD_GATEWAY;
        }

        $data['version'] = $version;
        $data['code'] = $status;

        return $data;
    }

    public function isDataRequired(): bool
    {
        return false;
    }
}
