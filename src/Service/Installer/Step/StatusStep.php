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
use App\Messenger\Message\AdServerFetchExchangeRate;
use App\Messenger\Message\AdServerGetBlocks;
use App\Messenger\Message\AdServerUpdateFiltering;
use App\Messenger\Message\AdServerUpdateTargeting;
use App\Repository\ConfigurationRepository;
use App\Service\Env\AdServerEnvVar;
use App\Service\Env\EnvEditorFactory;
use App\ValueObject\Module;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use WeakMap;

class StatusStep implements InstallerStep
{
    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly EnvEditorFactory $envEditorFactory,
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly MessageBusInterface $bus,
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
        $this->executeTasks();
        $envEditor = $this->envEditorFactory->createEnvEditor(Module::AdServer);
        $envEditor->setOne(AdServerEnvVar::AppSetup->value, '0');
    }

    private function executeTasks(): void
    {
        $this->bus->dispatch(new AdServerFetchExchangeRate());
        $this->bus->dispatch(new AdServerUpdateFiltering());
        $this->bus->dispatch(new AdServerUpdateTargeting());
        $this->bus->dispatch(new AdServerGetBlocks());
    }

    public function getName(): string
    {
        return InstallerStepEnum::Status->name;
    }

    public function fetchData(): array
    {
        $config = new WeakMap();
        $config[Module::AdClassify] = AdClassifyConfig::Url;
        $config[Module::AdPanel] = AdPanelConfig::Url;
        $config[Module::AdPay] = AdPayConfig::Url;
        $config[Module::AdSelect] = AdSelectConfig::Url;
        $config[Module::AdServer] = AdServerConfig::Url;
        $config[Module::AdUser] = AdUserConfig::Url;

        $data = [
            Configuration::COMMON_DATA_REQUIRED => $this->isDataRequired(),
        ];
        /** @var Module $module */
        foreach ($config as $module => $enum) {
            $url = $this->repository->fetchValueByEnum($enum);
            $data[$module->toLowerCase()] = $this->getModuleStatus($module, $url);
        }
        $data['main.js'] = $this->getMainJsStatus($this->repository->fetchValueByEnum(AdServerConfig::Url));

        return $data;
    }

    private function getModuleStatus(Module $module, ?string $url): array
    {
        $data = [
            'module' => $module->name,
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
            TransportExceptionInterface $exception
        ) {
            $this->logger->warning(
                sprintf('Fetching status of %s failed: %s', $module->name, $exception->getMessage())
            );
            $status = Response::HTTP_BAD_GATEWAY;
        }

        $data['version'] = $version;
        $data['code'] = $status;

        return $data;
    }

    private function getMainJsStatus(string $adServerUrl): array
    {
        $url = $adServerUrl . '/main.js';
        try {
            $response = $this->httpClient->request('GET', $url);
            $status = $response->getStatusCode();
        } catch (
            ClientExceptionInterface |
            RedirectionExceptionInterface |
            ServerExceptionInterface |
            TransportExceptionInterface $exception
        ) {
            $this->logger->warning(
                sprintf('Fetching status of main.js failed: %s', $exception->getMessage())
            );
            $status = Response::HTTP_BAD_GATEWAY;
        }
        return [
            'module' => 'main.js',
            'version' => 'N/A',
            'url' => $url,
            'code' => $status,
        ];
    }

    public function isDataRequired(): bool
    {
        return false;
    }
}
