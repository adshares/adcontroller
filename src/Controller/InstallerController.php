<?php

namespace App\Controller;

use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\AppStateEnum;
use App\Exception\InvalidArgumentException;
use App\Exception\ServiceNotPresent;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerJoiningFeeSender;
use App\Service\Configurator\Category\Wallet;
use App\Service\DataCollector;
use App\Service\Installer\Step\BaseStep;
use App\Service\Installer\Step\ClassifierStep;
use App\Service\Installer\Step\DnsStep;
use App\Service\Installer\Step\LicenseStep;
use App\Service\Installer\Step\SmtpStep;
use App\Service\Installer\Step\StatusStep;
use App\Service\Installer\Step\WalletStep;
use App\Utility\Validator\AdsAccountValidator;
use App\Utility\Validator\ClickAmountValidator;
use App\ValueObject\AccountId;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class InstallerController extends AbstractController
{
    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly DataCollector $dataCollector,
        private readonly LoggerInterface $logger,
    ) {
    }

    #[Route('/step', name: 'previous_step', methods: ['GET'])]
    public function previousStep(ConfigurationRepository $repository): JsonResponse
    {
        $step = $repository->fetchValueByEnum(AppConfig::InstallerStep);

        return $this->json([AppConfig::InstallerStep->name => $step]);
    }

    #[Route('/step/{step}', name: 'get_step', methods: ['GET'])]
    public function getStep(string $step): JsonResponse
    {
        if (
            AppStateEnum::AdserverAccountCreated
            === AppStateEnum::tryFrom($this->repository->fetchValueByEnum(AppConfig::AppState))
        ) {
            $this->dataCollector->synchronize();
            $this->repository->insertOrUpdateOne(AppConfig::AppState, AppStateEnum::MigrationCompleted->name);
        }
        if (1 !== preg_match('/^[a-z]+$/', $step)) {
            throw new UnprocessableEntityHttpException(sprintf('Invalid step (%s)', $step));
        }

        try {
            $service = $this->container->get($step . '_step');
        } catch (NotFoundExceptionInterface | ContainerExceptionInterface) {
            throw new UnprocessableEntityHttpException(sprintf('Unsupported step (%s)', $step));
        }

        try {
            $data = $service->fetchData();
        } catch (UnexpectedResponseException | ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_INTERNAL_SERVER_ERROR, $exception->getMessage());
        }

        return new JsonResponse(
            json_encode($data, JsonResponse::DEFAULT_ENCODING_OPTIONS | JSON_FORCE_OBJECT),
            Response::HTTP_OK,
            [],
            true
        );
    }

    #[Route('/step/{step}', name: 'set_step', methods: ['POST'])]
    public function setStep(string $step, Request $request): JsonResponse
    {
        if (1 !== preg_match('/^[a-z]+$/', $step)) {
            throw new UnprocessableEntityHttpException(sprintf('Invalid step (%s)', $step));
        }

        $content = json_decode($request->getContent(), true) ?? [];

        try {
            $service = $this->container->get($step . '_step');
        } catch (NotFoundExceptionInterface | ContainerExceptionInterface) {
            throw new UnprocessableEntityHttpException(sprintf('Unsupported step (%s)', $step));
        }

        try {
            $service->process($content);
        } catch (InvalidArgumentException $invalidArgumentException) {
            throw new UnprocessableEntityHttpException($invalidArgumentException->getMessage());
        } catch (UnexpectedResponseException $exception) {
            throw new HttpException(Response::HTTP_INTERNAL_SERVER_ERROR, $exception->getMessage());
        }

        return $this->json(['message' => 'Data saved successfully']);
    }

    #[Route('/node_host', name: 'node_host', methods: ['POST'])]
    public function getNodeHost(Request $request, Wallet $wallet): JsonResponse
    {
        $content = json_decode($request->getContent(), true);
        if (
            !isset($content[AdServerConfig::WalletAddress->name]) ||
            !is_string($content[AdServerConfig::WalletAddress->name]) ||
            !AccountId::isValid($content[AdServerConfig::WalletAddress->name])
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid ADS account', AdServerConfig::WalletAddress->name)
            );
        }

        $accountId = new AccountId($content[AdServerConfig::WalletAddress->name]);
        try {
            $nodeHost = $wallet->getNodeHostByAccountAddress($accountId);
        } catch (InvalidArgumentException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }

        return $this->json(
            [
                AdServerConfig::WalletNodeHost->name => $nodeHost,
                AdServerConfig::WalletNodePort->name => 6511,
            ]
        );
    }

    #[Route('/license_key', name: 'set_license_key', methods: ['POST'])]
    public function setLicenseKey(Request $request, LicenseStep $licenseStep): Response
    {
        $content = json_decode($request->getContent(), true);
        $licenseStep->setLicenseKey($content);

        return $this->getStep('license');
    }

    #[Route('/community_license', name: 'claim_license', methods: ['GET'])]
    public function claimCommunityLicense(LicenseStep $licenseStep): Response
    {
        $licenseStep->claimCommunityLicense();

        return $this->getStep('license');
    }

    #[Route('/joining_fee', name: 'joining_fee', methods: ['POST'])]
    public function sendJoiningFee(
        AdServerJoiningFeeSender $adServerJoiningFeeSender,
        Request $request,
    ): Response {
        $content = json_decode($request->getContent(), true);
        if (!isset($content['walletAddress']) || !(new AdsAccountValidator())->valid($content['walletAddress'])) {
            throw new UnprocessableEntityHttpException('Field `walletAddress` must be a valid ADS account');
        }
        if (
            !isset($content['amount']) ||
            !(new ClickAmountValidator())->valid($content['amount'])
        ) {
            throw new UnprocessableEntityHttpException('Field `amount` must be an amount in clicks');
        }

        try {
            $adServerJoiningFeeSender->send($content['walletAddress'], $content['amount']);
        } catch (ProcessFailedException $exception) {
            $this->logger->warning('Sending joining fee failed', ['exception' => $exception]);
            throw new UnprocessableEntityHttpException('Joining fee cannot be sent');
        }

        return new Response();
    }

    public static function getSubscribedServices(): array
    {
        return array_merge(parent::getSubscribedServices(), [
            'base_step' => BaseStep::class,
            'classifier_step' => ClassifierStep::class,
            'dns_step' => DnsStep::class,
            'license_step' => LicenseStep::class,
            'smtp_step' => SmtpStep::class,
            'status_step' => StatusStep::class,
            'wallet_step' => WalletStep::class,
        ]);
    }
}
