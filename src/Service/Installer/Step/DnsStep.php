<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\EnvEditor;
use App\Service\ServicePresenceChecker;
use App\ValueObject\Module;
use Symfony\Component\HttpFoundation\Response;
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
            'AdPanel' => EnvEditor::ADSERVER_ADPANEL_URL,
            'AdServer' => EnvEditor::ADSERVER_APP_URL,
            'AdUser' => EnvEditor::ADSERVER_ADUSER_BASE_URL,
        ];

        $values = $envEditor->get(array_values($config));

        $data = [];
        foreach ($config as $service => $key) {
            $url = $values[$key] ?? null;
            $status = $this->getServiceStatus($url);
            $data[strtolower($service)] = [
                'module' => $service,
                'url' => $url,
                'code' => $status,
            ];
        }

        return $data;
    }

    private function getServiceStatus(?string $url): int
    {
        if (!$url) {
            return Response::HTTP_BAD_GATEWAY;
        }

        try {
            $response = $this->httpClient->request('GET', $url . '/info.json');
            $status = $response->getStatusCode();
        } catch (TransportExceptionInterface) {
            $status = Response::HTTP_BAD_GATEWAY;
        }

        return $status;
    }
}
