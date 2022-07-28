<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
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
    private AdServerConfigurationClient $adServerConfigurationClient;
    private ConfigurationRepository $repository;
    private HttpClientInterface $httpClient;

    public function __construct(
        AdServerConfigurationClient $adServerConfigurationClient,
        ConfigurationRepository $repository,
        HttpClientInterface $httpClient
    ) {
        $this->adServerConfigurationClient = $adServerConfigurationClient;
        $this->repository = $repository;
        $this->httpClient = $httpClient;
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
