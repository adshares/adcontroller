<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\App;
use App\Entity\Enum\AppStateEnum;
use App\Entity\Enum\InstallerStepEnum;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
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
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
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
        $configuration = $this->adServerConfigurationClient->fetch();

        $config = [
            Module::ADCLASSIFY => Configuration::ADCLASSIFY_URL,
            Module::ADPANEL => Configuration::BASE_ADPANEL_URL,
            Module::ADPAY => Configuration::ADPAY_URL,
            Module::ADSELECT => Configuration::ADSELECT_URL,
            Module::ADSERVER => Configuration::BASE_ADSERVER_URL,
            Module::ADUSER => Configuration::BASE_ADUSER_URL,
        ];

        $data = [
            Configuration::COMMON_DATA_REQUIRED => $this->isDataRequired(),
        ];
        foreach ($config as $moduleName => $key) {
            $url = $configuration[$key] ?? null;
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
