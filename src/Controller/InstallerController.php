<?php

namespace App\Controller;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\Installer\Step\BaseStep;
use App\Service\Installer\Step\ClassifierStep;
use App\Service\Installer\Step\DnsStep;
use App\Service\Installer\Step\LicenseStep;
use App\Service\Installer\Step\SmtpStep;
use App\Service\Installer\Step\StatusStep;
use App\Service\Installer\Step\WalletStep;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class InstallerController extends AbstractController
{
    #[Route('/step', name: 'previous_step', methods: ['GET'])]
    public function previousStep(ConfigurationRepository $repository): JsonResponse
    {
        $step = $repository->fetchValueByName(Configuration::INSTALLER_STEP);

        return $this->json([Configuration::INSTALLER_STEP => $step]);
    }

    #[Route('/step/{step}', name: 'get_step', methods: ['GET'])]
    public function getStep(string $step): JsonResponse
    {
        if (1 !== preg_match('/^[a-z]+$/', $step)) {
            throw new UnprocessableEntityHttpException(sprintf('Invalid step (%s)', $step));
        }

        try {
            $service = $this->container->get($step . '_step');
        } catch (NotFoundExceptionInterface | ContainerExceptionInterface) {
            throw new UnprocessableEntityHttpException(sprintf('Unsupported step (%s)', $step));
        }

        $data = $service->fetchData();

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

        $content = json_decode($request->getContent(), true);

        try {
            $service = $this->container->get($step . '_step');
        } catch (NotFoundExceptionInterface | ContainerExceptionInterface) {
            throw new UnprocessableEntityHttpException(sprintf('Unsupported step (%s)', $step));
        }

        $service->process($content);

        return $this->json(['message' => 'Data saved successfully']);
    }

    #[Route('/community_license', name: 'claim_license', methods: ['GET'])]
    public function claimCommunityLicense(LicenseStep $licenseStep): JsonResponse
    {
        $licenseStep->claimCommunityLicense();

        return $this->json(['message' => 'Community license saved successfully']);
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
