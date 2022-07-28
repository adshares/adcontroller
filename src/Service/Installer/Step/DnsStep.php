<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
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
        $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $this->getName());
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_DNS;
    }

    public function fetchData(): array
    {
        $values = $this->adServerConfigurationClient->fetch();

        $config = [
            Module::ADPANEL => Configuration::BASE_ADPANEL_URL,
            Module::ADSERVER => Configuration::BASE_ADSERVER_URL,
            Module::ADUSER => Configuration::BASE_ADUSER_URL,
        ];

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
