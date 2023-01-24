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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class MonitoringController extends AbstractController
{
    private const ALLOWED_KEYS = [
        'events',
        'events/latest',
        'events/types',
        'hosts',
        'users',
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
        } catch (OutdatedLicense $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }

        return $this->jsonOk([Configuration::LICENSE_DATA => $license->toArray()]);
    }

    #[Route('/{key}', name: 'fetch_by_key', requirements: ['key' => '.+'], methods: ['GET'])]
    public function fetch(
        string $key,
        AdServerConfigurationClient $adServerConfigurationClient,
        Request $request,
    ): JsonResponse {
        if (!in_array($key, self::ALLOWED_KEYS, true)) {
            throw new UnprocessableEntityHttpException('Invalid resource');
        }

        try {
            $data = $adServerConfigurationClient->proxyMonitoringRequest($request, $key);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }

        return $this->jsonOk($data);
    }

    #[Route('/hosts/{hostId}/reset', name: 'reset_host_connection_error', methods: ['PATCH'])]
    public function resetHostConnectionError(
        int $hostId,
        AdServerConfigurationClient $adServerConfigurationClient,
    ): JsonResponse {
        try {
            $data = $adServerConfigurationClient->resetHostConnectionError($hostId);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }

        return $this->jsonOk($data);
    }

    #[Route('/users', name: 'add_user', methods: ['POST'])]
    public function addUser(
        AdServerConfigurationClient $adServerConfigurationClient,
        Request $request,
    ): JsonResponse {
        $content = json_decode($request->getContent(), true) ?? [];
        try {
            $data = $adServerConfigurationClient->addUser($content);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }

        return $this->jsonOk($data);
    }

    #[Route('/users/{userId}', name: 'edit_user', methods: ['PATCH'])]
    public function editUser(
        int $userId,
        AdServerConfigurationClient $adServerConfigurationClient,
        Request $request,
    ): JsonResponse {
        $content = json_decode($request->getContent(), true) ?? [];
        try {
            $data = $adServerConfigurationClient->editUser($userId, $content);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }

        return $this->jsonOk($data);
    }

    #[Route('/users/{userId}', name: 'delete_user', methods: ['DELETE'])]
    public function deleteUser(
        int $userId,
        AdServerConfigurationClient $adServerConfigurationClient,
    ): JsonResponse {
        try {
            $adServerConfigurationClient->deleteUser($userId);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }

        return $this->jsonOk();
    }

    #[Route('/users/{userId}/{action}', name: 'patch_user', methods: ['PATCH'])]
    public function patchUser(
        int $userId,
        string $action,
        AdServerConfigurationClient $adServerConfigurationClient,
        Request $request,
    ): JsonResponse {
        $content = json_decode($request->getContent(), true) ?? [];
        try {
            $data = $adServerConfigurationClient->patchUser($userId, $action, $content);
        } catch (ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_GATEWAY_TIMEOUT, $exception->getMessage());
        } catch (UnexpectedResponseException $exception) {
            $this->rethrowUnexpectedResponseException($exception);
        }

        return $this->jsonOk($data);
    }

    protected function jsonOk(array $data = []): JsonResponse
    {
        if (array_key_exists('data', $data)) {
            $response = $data;
        } else {
            $response = ['data' => $data];
        }
        $response['code'] = Response::HTTP_OK;
        $response['message'] = 'OK';

        return parent::json($response);
    }

    private function rethrowUnexpectedResponseException(UnexpectedResponseException $exception): void
    {
        $statusCode = $exception->getCode() >= 400 && $exception->getCode() < 500
            ? $exception->getCode()
            : Response::HTTP_BAD_GATEWAY;
        throw new HttpException($statusCode, $exception->getMessage());
    }
}
