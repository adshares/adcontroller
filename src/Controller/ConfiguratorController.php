<?php

namespace App\Controller;

use App\Entity\Enum\AdClassifyConfig;
use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\AdPayConfig;
use App\Entity\Enum\AdSelectConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AdUserConfig;
use App\Entity\Enum\GeneralConfig;
use App\Exception\InvalidArgumentException;
use App\Exception\ServiceNotPresent;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Service\Configurator\Category\AutomaticWithdrawal;
use App\Service\Configurator\Category\BannerSettings;
use App\Service\Configurator\Category\BaseInformation;
use App\Service\Configurator\Category\CampaignSettings;
use App\Service\Configurator\Category\ColdWallet;
use App\Service\Configurator\Category\Commission;
use App\Service\Configurator\Category\CrmNotifications;
use App\Service\Configurator\Category\DemandSettlementOptions;
use App\Service\Configurator\Category\License;
use App\Service\Configurator\Category\PanelAssets;
use App\Service\Configurator\Category\PanelPlaceholders;
use App\Service\Configurator\Category\Registration;
use App\Service\Configurator\Category\Regulations;
use App\Service\Configurator\Category\RejectedDomains;
use App\Service\Configurator\Category\SiteOptions;
use App\Service\Configurator\Category\Smtp;
use App\Service\Configurator\Category\Wallet;
use App\Service\Configurator\Category\Whitelist;
use App\Service\Configurator\Category\ZoneOptions;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class ConfiguratorController extends AbstractController
{
    private const CONFIGURATION_SERVICES = [
        'auto-withdrawal-config' => AutomaticWithdrawal::class,
        'banner-settings-config' => BannerSettings::class,
        'campaign-settings-config' => CampaignSettings::class,
        'demand/settlement-options-config' => DemandSettlementOptions::class,
        'base-information-config' => BaseInformation::class,
        'cold-wallet-config' => ColdWallet::class,
        'commission-config' => Commission::class,
        'crm-notifications-config' => CrmNotifications::class,
        'license-config' => License::class,
        'panel-placeholders-config' => PanelPlaceholders::class,
        'registration-config' => Registration::class,
        'regulations-config' => Regulations::class,
        'rejected-domains-config' => RejectedDomains::class,
        'smtp-config' => Smtp::class,
        'site-options-config' => SiteOptions::class,
        'wallet-config' => Wallet::class,
        'whitelist-config' => Whitelist::class,
        'zone-options-config' => ZoneOptions::class,
    ];

    #[Route('/config', name: 'fetch_config', methods: ['GET'])]
    public function fetchConfig(ConfigurationRepository $repository): JsonResponse
    {
        $data = [];
        $classes = [
            AdClassifyConfig::class,
            AdPanelConfig::class,
            AdPayConfig::class,
            AdSelectConfig::class,
            AdServerConfig::class,
            AdUserConfig::class,
            GeneralConfig::class,
        ];

        foreach ($classes as $class) {
            $data[$class::MODULE] = $repository->fetchValuesByNames(
                $class::MODULE,
                array_map(fn($enum) => $enum->name, $class::cases())
            );
        }
        $data = self::appendSmtpPassword($data, $repository->fetchValueByEnum(GeneralConfig::SmtpPassword));
        $data = self::processInventory($data);

        return $this->jsonOk($data);
    }

    private static function appendSmtpPassword(array $data, ?string $smtpPassword): array
    {
        if (null !== $smtpPassword && strlen($smtpPassword) > 0) {
            $data[GeneralConfig::MODULE][GeneralConfig::SmtpPassword->name] = '********';
        } else {
            $data[GeneralConfig::MODULE][GeneralConfig::SmtpPassword->name] = '';
        }
        return $data;
    }

    private static function processInventory(array $data): array
    {
        $adServerData = $data[AdServerConfig::MODULE];
        if (
            ArrayUtils::equal(
                $adServerData[AdServerConfig::InventoryExportWhitelist->name],
                $adServerData[AdServerConfig::InventoryImportWhitelist->name],
            )
        ) {
            $data[AdServerConfig::MODULE][AdServerConfig::InventoryWhitelist->name] =
                $adServerData[AdServerConfig::InventoryExportWhitelist->name];
            unset($data[AdServerConfig::MODULE][AdServerConfig::InventoryExportWhitelist->name]);
            unset($data[AdServerConfig::MODULE][AdServerConfig::InventoryImportWhitelist->name]);
        } else {
            unset($data[AdServerConfig::MODULE][AdServerConfig::InventoryWhitelist->name]);
        }

        $whiteList = $adServerData[AdServerConfig::InventoryWhitelist->name];
        $privateInventory = 1 === count($whiteList) &&
            $whiteList[0] === $adServerData[AdServerConfig::WalletAddress->name];
        $data[AdServerConfig::MODULE][AdServerConfig::InventoryPrivate->name] = $privateInventory;

        return $data;
    }

    #[Route('/config/panel-assets', name: 'store_panel_assets', methods: ['POST'])]
    public function storePanelAssets(Request $request, PanelAssets $panelAssets): JsonResponse
    {
        $content = [];
        foreach ($request->files as $filename => $file) {
            $content[$filename] = $file;
        }

        try {
            $storedAssets = $panelAssets->process($content);
        } catch (InvalidArgumentException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }

        return $this->jsonOk(['assets' => $storedAssets]);
    }

    #[Route('/config/panel-assets', name: 'fetch_panel_assets', methods: ['GET'])]
    public function fetchPanelAssets(PanelAssets $panelAssets): JsonResponse
    {
        $result = $panelAssets->list();

        return $this->jsonOk(['assets' => $result]);
    }

    #[Route('/config/panel-assets', name: 'remove_panel_assets', methods: ['DELETE'])]
    public function removePanelAssets(Request $request, PanelAssets $panelAssets): JsonResponse
    {
        $content = json_decode($request->getContent(), true) ?? [];
        $fileIds = $content['fileIds'] ?? null;
        if (null !== $fileIds) {
            if (!is_array($fileIds)) {
                throw new InvalidArgumentException('Field `fileIds` must be an array');
            }
            foreach ($fileIds as $fileId) {
                if (!is_string($fileId)) {
                    throw new InvalidArgumentException('Field `fileIds.*` must be a string');
                }
            }
        }
        $removedFileIds = $panelAssets->remove($fileIds);

        return $this->jsonOk(['fileIds' => $removedFileIds]);
    }

    #[Route('/config/rejected-domains', name: 'fetch_rejected_domains', methods: ['GET'])]
    public function fetchRejectedDomains(AdServerConfigurationClient $adServerConfigurationClient): JsonResponse
    {
        try {
            $result = $adServerConfigurationClient->fetchRejectedDomains();
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }

        return $this->jsonOk($result);
    }

    #[Route('/config/{category}', name: 'store_config', requirements: ['category' => '^[a-z\-\/]+$'], methods: ['PATCH'])]
    public function storeConfig(string $category, ConfigurationRepository $repository, Request $request): JsonResponse
    {
        try {
            $service = $this->container->get($category . '-config');
        } catch (NotFoundExceptionInterface|ContainerExceptionInterface) {
            throw new UnprocessableEntityHttpException(sprintf('Unsupported category (%s)', $category));
        }

        $content = json_decode($request->getContent(), true) ?? [];
        try {
            $result = $service->process($content);
        } catch (InvalidArgumentException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }

        if (Smtp::class === $service::class) {
            if (isset($content[GeneralConfig::SmtpPassword->name])) {
                $result = self::appendSmtpPassword($result, $content[GeneralConfig::SmtpPassword->name]);
            }
        } elseif (Whitelist::class === $service::class) {
            $result[AdServerConfig::MODULE][AdServerConfig::WalletAddress->name] =
                $repository->fetchValueByEnum(AdServerConfig::WalletAddress);
            $result = self::processInventory($result);
            unset($result[AdServerConfig::MODULE][AdServerConfig::WalletAddress->name]);
        }
        return $this->jsonOk($result);
    }

    #[Route('/synchronize-config', name: 'synchronize_config', methods: ['GET'])]
    public function synchronizeConfig(DataCollector $dataCollector): JsonResponse
    {
        try {
            $changes = $dataCollector->synchronize();
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }

        return $this->jsonOk($changes);
    }

    #[Route('/supply-placeholders', name: 'fetch_placeholders', methods: ['GET'])]
    public function fetchPlaceholders(
        AdServerConfigurationClient $adServerConfigurationClient,
        Request $request,
    ): JsonResponse {
        try {
            $data = $adServerConfigurationClient->fetchCreativePlaceholders($request);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }
        return $this->jsonOk($data);
    }

    #[Route('/supply-placeholders', name: 'upload_placeholders', methods: ['POST'])]
    public function uploadPlaceholders(
        AdServerConfigurationClient $adServerConfigurationClient,
        Request $request,
    ): JsonResponse {
        try {
            $data = $adServerConfigurationClient->uploadCreativePlaceholders($request);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }
        return $this->jsonOk($data);
    }

    #[Route('/supply-placeholders/{uuid}', name: 'delete_placeholders', methods: ['DELETE'])]
    public function deletePlaceholders(
        string $uuid,
        AdServerConfigurationClient $adServerConfigurationClient,
    ): JsonResponse {
        try {
            $adServerConfigurationClient->deleteCreativePlaceholder($uuid);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }
        return $this->jsonOk();
    }

    #[Route('/taxonomy/media', name: 'taxonomy_media', methods: ['GET'])]
    public function fetchTaxonomyMedia(
        AdServerConfigurationClient $adServerConfigurationClient,
    ): JsonResponse {
        try {
            $data = $adServerConfigurationClient->fetchTaxonomyMedia();
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }
        return $this->jsonOk($data);
    }

    #[Route('/taxonomy/media/{medium}', name: 'taxonomy_medium', methods: ['GET'])]
    public function fetchTaxonomyMedium(
        string $medium,
        AdServerConfigurationClient $adServerConfigurationClient,
        Request $request,
    ): JsonResponse {
        try {
            $data = $adServerConfigurationClient->fetchTaxonomyMedium($medium, $request->query->get('vendor'));
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }
        return $this->jsonOk($data);
    }

    #[Route('/taxonomy/media/{medium}/vendors', name: 'taxonomy_vendors', methods: ['GET'])]
    public function fetchTaxonomyVendors(
        string $medium,
        AdServerConfigurationClient $adServerConfigurationClient,
    ): JsonResponse {
        try {
            $data = $adServerConfigurationClient->fetchTaxonomyVendors($medium);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }
        return $this->jsonOk($data);
    }

    public static function getSubscribedServices(): array
    {
        return array_merge(parent::getSubscribedServices(), self::CONFIGURATION_SERVICES);
    }

    protected function jsonOk(array $data = []): JsonResponse
    {
        return parent::json([
            'message' => 'OK',
            'code' => Response::HTTP_OK,
            'data' => $data,
        ]);
    }

    private function rethrowUnexpectedResponseException(UnexpectedResponseException $exception): void
    {
        $statusCode = $exception->getCode() >= 400 && $exception->getCode() < 500
            ? $exception->getCode()
            : Response::HTTP_BAD_GATEWAY;
        throw new HttpException($statusCode, $exception->getMessage());
    }
}
