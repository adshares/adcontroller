<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdClassifyConfig;
use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\AdPayConfig;
use App\Entity\Enum\AdSelectConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AdUserConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\AppStateEnum;
use App\Entity\Enum\InstallerStepEnum;
use App\Repository\ConfigurationRepository;
use App\Service\Env\AdServerEnvVar;
use App\Service\Env\EnvEditor;
use App\Service\ServicePresenceChecker;
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
        private readonly HttpClientInterface $httpClient,
        private readonly ServicePresenceChecker $servicePresenceChecker,
    ) {
    }

    public function process(array $content): void
    {
        $this->repository->insertOrUpdate(
            AppConfig::MODULE,
            [
                AppConfig::InstallerStep->name => $this->getName(),
                AppConfig::AppState->name => AppStateEnum::InstallationCompleted->name,
            ]
        );
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
        $envEditor->setOne(AdServerEnvVar::AppSetup->value, '0');
    }

    public function getName(): string
    {
        return InstallerStepEnum::Status->name;
    }

    public function fetchData(): array
    {
        $config = [
            Module::ADCLASSIFY => AdClassifyConfig::Url,
            Module::ADPANEL => AdPanelConfig::Url,
            Module::ADPAY => AdPayConfig::Url,
            Module::ADSELECT => AdSelectConfig::Url,
            Module::ADSERVER => AdServerConfig::Url,
            Module::ADUSER => AdUserConfig::Url,
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
