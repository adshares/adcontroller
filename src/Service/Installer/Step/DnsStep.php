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

class DnsStep implements InstallerStep
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
        $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $this->getName());
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_DNS;
    }

    public function fetchData(): array
    {
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));

        $config = [
            Module::ADPANEL => EnvEditor::ADSERVER_ADPANEL_URL,
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
        if (!$url) {
            return [
                'module' => $module->getDisplayableName(),
                'url' => $url,
                'code' => Response::HTTP_PRECONDITION_FAILED,
            ];
        }

        try {
            $response = $this->httpClient->request('GET', $url . '/info.json');
            $infoModule = json_decode($response->getContent())->module ?? null;
            if ($module->getInfoName() !== $infoModule) {
                $status = Response::HTTP_NOT_IMPLEMENTED;
            } else {
                $status = $response->getStatusCode();
            }
        } catch (
            ClientExceptionInterface |
            RedirectionExceptionInterface |
            ServerExceptionInterface |
            TransportExceptionInterface
        ) {
            $status = Response::HTTP_BAD_GATEWAY;
        }

        return [
            'module' => $module->getDisplayableName(),
            'url' => $url,
            'code' => $status,
        ];
    }

    public function isDataRequired(): bool
    {
        return false;
    }
}
