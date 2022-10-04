<?php

namespace App\Controller;

use App\Entity\Configuration;
use App\Entity\Enum\AdServerConfig;
use App\Exception\OutdatedLicense;
use App\Exception\ServiceNotPresent;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Service\LicenseReader;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/monitoring', name: 'api_monitoring_')]
class MonitoringController extends AbstractController
{
    private const ALLOWED_KEYS = [
        'hosts',
        'wallet',
    ];

    #[Route('/license-data', name: 'fetch_license_data', methods: ['GET'])]
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

    #[Route('/{key}', name: 'fetch_by_key', methods: ['GET'])]
    public function fetch(string $key, AdServerConfigurationClient $adServerConfigurationClient): JsonResponse
    {
        if (!in_array($key, self::ALLOWED_KEYS, true)) {
            throw new UnprocessableEntityHttpException('Invalid resource');
        }

        try {
            $data = $adServerConfigurationClient->fetchMonitoringData($key);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            throw new HttpException(Response::HTTP_BAD_GATEWAY, $exception->getMessage());
        }

        return $this->jsonOk($data);
    }

    #[Route('/hosts/{hostId}/reset', name: 'reset_host_connection_error', methods: ['PATCH'])]
    public function resetHostConnectionError(int $hostId, AdServerConfigurationClient $adServerConfigurationClient): JsonResponse
    {
        try {
            $data = $adServerConfigurationClient->resetHostConnectionError($hostId);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            throw new HttpException(Response::HTTP_BAD_GATEWAY, $exception->getMessage());
        }

        return $this->jsonOk($data);
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
