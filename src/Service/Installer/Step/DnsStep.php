<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AdUserConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\InstallerStepEnum;
use App\Repository\ConfigurationRepository;
use App\ValueObject\Module;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use WeakMap;

class DnsStep implements InstallerStep
{
    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly HttpClientInterface $httpClient
    ) {
    }

    public function process(array $content): void
    {
        $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
    }

    public function getName(): string
    {
        return InstallerStepEnum::Dns->name;
    }

    public function fetchData(): array
    {
        $config = new WeakMap();
        $config[Module::AdPanel] = AdPanelConfig::Url;
        $config[Module::AdServer] = AdServerConfig::Url;
        $config[Module::AdUser] = AdUserConfig::Url;

        $data = [
            Configuration::COMMON_DATA_REQUIRED => $this->isDataRequired(),
        ];
        foreach ($config as $module => $enum) {
            $url = $this->repository->fetchValueByEnum($enum);
            $data[strtolower($module->name)] = $this->getModuleDnsStatus($module, $url);
        }

        return $data;
    }

    private function getModuleDnsStatus(Module $module, ?string $url): array
    {
        if (!$url) {
            return [
                'module' => $module->name,
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
            'module' => $module->name,
            'url' => $url,
            'code' => $status,
        ];
    }

    public function isDataRequired(): bool
    {
        return false;
    }
}
