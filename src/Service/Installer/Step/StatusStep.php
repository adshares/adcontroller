<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\EnvEditor;
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
    private ConfigurationRepository $repository;
    private HttpClientInterface $httpClient;
    private ServicePresenceChecker $servicePresenceChecker;

    public function __construct(
        ConfigurationRepository $repository,
        HttpClientInterface $httpClient,
        ServicePresenceChecker $servicePresenceChecker
    ) {
        $this->repository = $repository;
        $this->httpClient = $httpClient;
        $this->servicePresenceChecker = $servicePresenceChecker;
    }

    public function process(array $content): void
    {
        $this->repository->insertOrUpdate(
            [
                Configuration::INSTALLER_STEP => $this->getName(),
                Configuration::APP_STATE => Configuration::APP_STATE_INSTALLATION_COMPLETED,
            ]
        );
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_STATUS;
    }

    public function fetchData(): array
    {
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));

        $config = [
            Module::ADCLASSIFY => EnvEditor::ADSERVER_CLASSIFIER_EXTERNAL_BASE_URL,
            Module::ADPANEL => EnvEditor::ADSERVER_ADPANEL_URL,
            Module::ADPAY => EnvEditor::ADSERVER_ADPAY_ENDPOINT,
            Module::ADSELECT => EnvEditor::ADSERVER_ADSELECT_ENDPOINT,
            Module::ADSERVER => EnvEditor::ADSERVER_APP_URL,
            Module::ADUSER => EnvEditor::ADSERVER_ADUSER_BASE_URL,
        ];
        $values = $envEditor->get(array_values($config));

        $data = [
            Configuration::COMMON_DATA_REQUIRED => $this->isDataRequired(),
        ];
        foreach ($config as $moduleName => $key) {
            $url = $values[$key] ?? null;
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
