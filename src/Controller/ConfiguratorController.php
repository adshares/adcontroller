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
use App\Repository\ConfigurationRepository;
use App\Service\Configurator\Category\AutomaticWithdrawal;
use App\Service\Configurator\Category\ColdWallet;
use App\Service\Configurator\Category\Commission;
use App\Service\Configurator\Category\Registration;
use App\Service\Configurator\Category\SiteOptions;
use App\Service\Configurator\Category\Wallet;
use App\Service\Configurator\Category\ZoneOptions;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
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

        return $this->jsonOk($data);
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
        }

        return $this->jsonOk();
    }

    public static function getSubscribedServices(): array
    {
        return array_merge(parent::getSubscribedServices(), [
            'auto-withdrawal-config' => AutomaticWithdrawal::class,
            'cold-wallet-config' => ColdWallet::class,
            'commission-config' => Commission::class,
            'registration-config' => Registration::class,
            'site-options-config' => SiteOptions::class,
            'wallet-config' => Wallet::class,
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
