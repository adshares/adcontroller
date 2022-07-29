<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdPanel;
use App\Entity\Enum\AdServer;
use App\Entity\Enum\AdUser;
use App\Entity\Enum\App;
use App\Entity\Enum\InstallerStepEnum;
use App\Repository\ConfigurationRepository;
use App\ValueObject\Module;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class DnsStep implements InstallerStep
{
    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly HttpClientInterface $httpClient
    ) {
    }

    public function process(array $content): void
    {
        $this->repository->insertOrUpdateOne(App::INSTALLER_STEP, $this->getName());
    }

    public function getName(): string
    {
        return InstallerStepEnum::DNS->value;
    }

    public function fetchData(): array
    {
        $config = [
            Module::ADPANEL => AdPanel::BASE_ADPANEL_URL,
            Module::ADSERVER => AdServer::BASE_ADSERVER_URL,
            Module::ADUSER => AdUser::BASE_ADUSER_URL,
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
