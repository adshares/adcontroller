<?php

namespace App\Controller;

use App\Entity\Configuration;
use App\Entity\Enum\AdClassifyConfig;
use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\AdPayConfig;
use App\Entity\Enum\AdSelectConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AdUserConfig;
use App\Entity\Enum\GeneralConfig;
use App\Entity\Enum\RebrandingConfig;
use App\Exception\InvalidArgumentException;
use App\Exception\OutdatedLicense;
use App\Exception\ServiceNotPresent;
use App\Exception\UnexpectedResponseException;
use App\Repository\AssetRepository;
use App\Repository\ConfigurationRepository;
use App\Service\Configurator\Category\AutomaticWithdrawal;
use App\Service\Configurator\Category\BannerSettings;
use App\Service\Configurator\Category\BaseInformation;
use App\Service\Configurator\Category\CampaignSettings;
use App\Service\Configurator\Category\ColdWallet;
use App\Service\Configurator\Category\Commission;
use App\Service\Configurator\Category\CrmNotifications;
use App\Service\Configurator\Category\PanelAssets;
use App\Service\Configurator\Category\PanelPlaceholders;
use App\Service\Configurator\Category\Registration;
use App\Service\Configurator\Category\Regulations;
use App\Service\Configurator\Category\RejectedDomains;
use App\Service\Configurator\Category\SiteOptions;
use App\Service\Configurator\Category\Wallet;
use App\Service\Configurator\Category\Whitelist;
use App\Service\Configurator\Category\ZoneOptions;
use App\Service\Installer\Migrator;
use App\Service\LicenseReader;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class ConfiguratorController extends AbstractController
{
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
        self::appendAdServerPrivateInventory($data);

        return $this->jsonOk($data);
    }

    private static function appendAdServerPrivateInventory(array &$data): void
    {
        $whiteList = $data[AdServerConfig::MODULE][AdServerConfig::InventoryWhitelist->name] ?? [];
        $privateInventory = 1 === count($whiteList) &&
            $whiteList[0] === $data[AdServerConfig::MODULE][AdServerConfig::WalletAddress->name];

        $data[AdServerConfig::MODULE][AdServerConfig::InventoryPrivate->name] = $privateInventory;
    }

    #[Route('/config/license-data', name: 'fetch_config_license_data', methods: ['GET'])]
    public function fetchLicenseData(
        ConfigurationRepository $repository,
        LicenseReader $licenseReader,
    ): JsonResponse {
        $licenseKey = $repository->fetchValueByEnum(AdServerConfig::LicenseKey);

        if (null === $licenseKey) {
            throw new NotFoundHttpException('License key is missing');
        }

        try {
            $license = $licenseReader->read($licenseKey);
        } catch (OutdatedLicense) {
            throw new UnprocessableEntityHttpException('License is outdated');
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            throw new HttpException(Response::HTTP_BAD_GATEWAY, $exception->getMessage());
        }

        return $this->jsonOk([Configuration::LICENSE_DATA => $license->toArray()]);
    }

    #[Route('/config/panel-assets/{fileId}', name: 'fetch_panel_assets', methods: ['GET'])]
    public function fetchPanelAssets(string $fileId, AssetRepository $repository, PanelAssets $panelAssets): Response
    {
        $panelAssets->validateFileId($fileId);
        $entity = $repository->findOneBy(['module' => RebrandingConfig::MODULE, 'name' => $fileId]);

        $response = new StreamedResponse(function () use ($entity) {
            echo stream_get_contents($entity->getContent());
        });
        $response->headers->set('Content-Type', $entity->getMimeType());

        return $response;
    }

    #[Route('/config/panel-assets', name: 'store_panel_assets', methods: ['POST'])]
    public function storePanelAssets(Request $request, PanelAssets $panelAssets): JsonResponse
    {
        $content = [];
        foreach ($request->files as $filename => $file) {
            $content[$filename] = $file;
        }

        try {
            $panelAssets->process($content);
        } catch (InvalidArgumentException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }

        return $this->jsonOk();
    }

    #[Route('/config/{category}', name: 'store_config', methods: ['PATCH'])]
    public function storeConfig(string $category, Request $request): JsonResponse
    {
        try {
            $service = $this->container->get($category . '-config');
        } catch (NotFoundExceptionInterface | ContainerExceptionInterface) {
            throw new UnprocessableEntityHttpException(sprintf('Unsupported category (%s)', $category));
        }

        $content = json_decode($request->getContent(), true) ?? [];
        try {
            $service->process($content);
        } catch (InvalidArgumentException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            throw new HttpException(Response::HTTP_BAD_GATEWAY, $exception->getMessage());
        }

        return $this->jsonOk();
    }

    public static function getSubscribedServices(): array
    {
        return array_merge(parent::getSubscribedServices(), [
            'auto-withdrawal-config' => AutomaticWithdrawal::class,
            'banner-settings-config' => BannerSettings::class,
            'campaign-settings-config' => CampaignSettings::class,
            'base-information-config' => BaseInformation::class,
            'cold-wallet-config' => ColdWallet::class,
            'commission-config' => Commission::class,
            'crm-notifications-config' => CrmNotifications::class,
            'panel-placeholders-config' => PanelPlaceholders::class,
            'registration-config' => Registration::class,
            'regulations-config' => Regulations::class,
            'rejected-domains-config' => RejectedDomains::class,
            'site-options-config' => SiteOptions::class,
            'wallet-config' => Wallet::class,
            'whitelist-config' => Whitelist::class,
            'zone-options-config' => ZoneOptions::class,
        ]);
    }

    protected function jsonOk(array $data = []): JsonResponse
    {
        return parent::json([
            'message' => 'OK',
            'code' => Response::HTTP_OK,
            'data' => $data,
        ]);
    }
}
