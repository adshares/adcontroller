<?php

namespace App\Controller;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\LicenseDecoder;
use App\Service\LicenseServerClient;
use App\ValueObject\AccountId;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class InstallerController extends AbstractController
{
    private ConfigurationRepository $repository;

    public function __construct(ConfigurationRepository $repository)
    {
        $this->repository = $repository;
    }

    #[Route('/step', name: 'current_step', methods: ['GET'])]
    public function currentStep(): JsonResponse
    {
        $step = $this->repository->fetchValueByName(Configuration::INSTALLER_STEP);

        return $this->json([Configuration::INSTALLER_STEP => $step]);
    }

    #[Route('/step/{step}', name: 'get_step', methods: ['GET'])]
    public function getStep(string $step, LicenseServerClient $licenseServerClient): JsonResponse
    {
        switch ($step) {
            case Configuration::INSTALLER_STEP_BASE:
                $data = $this->repository->fetchValuesByNames([
                    Configuration::BASE_ADSERVER_NAME,
                    Configuration::BASE_CONTACT_EMAIL,
                    Configuration::BASE_DOMAIN,
                    Configuration::BASE_SUPPORT_EMAIL,
                ]);
                break;
            case Configuration::INSTALLER_STEP_CLASSIFIER:
                $data = [];
                break;
            case Configuration::INSTALLER_STEP_DNS:
                $data = $this->repository->fetchValuesByNames([
                    Configuration::BASE_DOMAIN,
                ]);
                break;
            case Configuration::INSTALLER_STEP_LICENSE:
                $data = $this->repository->fetchValuesByNames([
                    Configuration::BASE_ADSERVER_NAME,
                    Configuration::BASE_CONTACT_EMAIL,
                    Configuration::LICENSE_CONTACT_EMAIL,
                    Configuration::LICENSE_SECRET,
                ]);

                if (null !== ($secret = $data[Configuration::LICENSE_SECRET] ?? null)) {
                    unset($data[Configuration::LICENSE_SECRET]);

                    $id = substr($secret, 0, 10);
                    $encodedData = $licenseServerClient->fetchEncodedLicenseData($id);
                    $license = (new LicenseDecoder($secret))->decode($encodedData);
                    $data[Configuration::LICENSE_END_DATE] = $license->getEndDate();
                    $data[Configuration::LICENSE_OWNER] = $license->getOwner();
                    $data[Configuration::LICENSE_START_DATE] = $license->getStartDate();
                    $data[Configuration::LICENSE_TYPE] = $license->getType();
                }
                break;
            case Configuration::INSTALLER_STEP_SMTP:
                $data = $this->repository->fetchValuesByNames([
                    Configuration::SMTP_HOST,
                    Configuration::SMTP_PASSWORD,
                    Configuration::SMTP_PORT,
                    Configuration::SMTP_USERNAME,
                ]);
                break;
            case Configuration::INSTALLER_STEP_WALLET:
                $data = $this->repository->fetchValuesByNames([
                    Configuration::WALLET_ADDRESS,
                ]);
                break;
            default:
                throw new UnprocessableEntityHttpException(sprintf('Invalid step (%s)', $step));
        }

        return $this->json($data);
    }

    #[Route('/step/{step}', name: 'set_step', methods: ['POST'])]
    public function setStep(string $step, LicenseServerClient $licenseServerClient, Request $request): JsonResponse
    {
        $content = json_decode($request->getContent(), true);

        switch ($step) {
            case Configuration::INSTALLER_STEP_BASE:
                $fields = [
                    Configuration::BASE_ADSERVER_NAME,
                    Configuration::BASE_CONTACT_EMAIL,
                    Configuration::BASE_DOMAIN,
                    Configuration::BASE_SUPPORT_EMAIL,
                ];
                $this->validateBase($content, $fields);

                $data = [];
                foreach ($fields as $field) {
                    $data[$field] = $content[$field];
                }
                $data[Configuration::INSTALLER_STEP] = $step;
                $this->repository->insertOrUpdate($data);
                break;
            case Configuration::INSTALLER_STEP_CLASSIFIER:
            case Configuration::INSTALLER_STEP_DNS:
                $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $step);
                break;
            case Configuration::INSTALLER_STEP_LICENSE:
                if (null === ($name = $this->repository->fetchValueByName(Configuration::BASE_ADSERVER_NAME))) {
                    throw new UnprocessableEntityHttpException('AdServer\'s name must be set');
                }

                $fields = [
                    Configuration::LICENSE_CONTACT_EMAIL,
                ];
                $this->validateLicense($content, $fields);

                $message = $content[Configuration::LICENSE_CONTACT_EMAIL];
                $secret = $licenseServerClient->createCommunityLicense($message, $name);

                $this->repository->insertOrUpdate(
                    [
                        Configuration::INSTALLER_STEP => $step,
                        Configuration::LICENSE_CONTACT_EMAIL => $message,
                        Configuration::LICENSE_SECRET => $secret,
                    ]
                );
                break;
            case Configuration::INSTALLER_STEP_SMTP:
                if (null === ($sender = $this->repository->fetchValueByName(Configuration::BASE_CONTACT_EMAIL))) {
                    throw new UnprocessableEntityHttpException('Contact e-mail must be set');
                }
                if (null === ($receiver = $this->repository->fetchValueByName(Configuration::BASE_SUPPORT_EMAIL))) {
                    throw new UnprocessableEntityHttpException('Support e-mail must be set');
                }

                $fields = [
                    Configuration::SMTP_HOST,
                    Configuration::SMTP_PASSWORD,
                    Configuration::SMTP_PORT,
                    Configuration::SMTP_USERNAME,
                ];
                $this->validateSmtp($content, $fields);

                $message = (new Email())
                    ->from($sender)
                    ->to($receiver)
                    ->subject('Test message from AdController')
                    ->text('AdServer\'s mailer is set properly.');
                $dsn = $this->getMailerDsn(
                    $content[Configuration::SMTP_USERNAME],
                    $content[Configuration::SMTP_PASSWORD],
                    $content[Configuration::SMTP_HOST],
                    (int)$content[Configuration::SMTP_PORT],
                );
                $transport = Transport::fromDsn($dsn);
                $mailer = new Mailer($transport);
                $timeout = ini_get('default_socket_timeout');
                ini_set('default_socket_timeout', 10);
                try {
                    $mailer->send($message);
                } catch (TransportExceptionInterface) {
                    throw new UnprocessableEntityHttpException('Invalid configuration');
                } finally {
                    ini_set('default_socket_timeout', $timeout);
                }

                $data = [];
                foreach ($fields as $field) {
                    $data[$field] = $content[$field];
                }
                $data[Configuration::INSTALLER_STEP] = $step;
                $data[Configuration::APP_STATE] = Configuration::APP_STATE_INSTALLATION_COMPLETED;
                $this->repository->insertOrUpdate($data);
                break;
            case Configuration::INSTALLER_STEP_WALLET:
                $fields = [
                    Configuration::WALLET_ADDRESS,
                    Configuration::WALLET_SECRET_KEY,
                ];
                $this->validateWallet($content, $fields);

                $data = [];
                foreach ($fields as $field) {
                    $data[$field] = strtoupper($content[$field]);
                }
                $data[Configuration::INSTALLER_STEP] = $step;
                $this->repository->insertOrUpdate($data);
                break;
            default:
                throw new UnprocessableEntityHttpException(sprintf('Invalid step (%s)', $step));
        }

        return $this->json(['message' => 'Data saved successfully']);
    }

    private function validateBase(mixed $content, array $fields): void
    {
        foreach ($fields as $field) {
            if (!isset($content[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }
        if (!filter_var($content[Configuration::BASE_CONTACT_EMAIL], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', Configuration::BASE_CONTACT_EMAIL)
            );
        }
        if (!filter_var($content[Configuration::BASE_SUPPORT_EMAIL], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', Configuration::BASE_SUPPORT_EMAIL)
            );
        }
        if (!filter_var($content[Configuration::BASE_DOMAIN], FILTER_VALIDATE_DOMAIN)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a domain', Configuration::BASE_DOMAIN)
            );
        }
    }

    private function validateLicense(mixed $content, array $fields): void
    {
        foreach ($fields as $field) {
            if (!isset($content[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }
        if (!filter_var($content[Configuration::LICENSE_CONTACT_EMAIL], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', Configuration::LICENSE_CONTACT_EMAIL)
            );
        }
    }

    private function validateSmtp(mixed $content, array $fields): void
    {
        foreach ($fields as $field) {
            if (!isset($content[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }
        if (!filter_var($content[Configuration::SMTP_HOST], FILTER_VALIDATE_DOMAIN)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a host', Configuration::SMTP_HOST)
            );
        }
        if (!filter_var($content[Configuration::SMTP_PORT], FILTER_VALIDATE_INT)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an integer', Configuration::BASE_SUPPORT_EMAIL)
            );
        }
    }

    private function validateWallet(mixed $content, array $fields): void
    {
        foreach ($fields as $field) {
            if (!isset($content[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }
        if (1 !== preg_match('/^[0-9A-F]{64}$/i', $content[Configuration::WALLET_SECRET_KEY])) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a hexadecimal string of 64 characters', Configuration::WALLET_SECRET_KEY)
            );
        }
        if (
            !is_string($content[Configuration::WALLET_ADDRESS]) ||
            !AccountId::isValid($content[Configuration::WALLET_ADDRESS])
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid ADS account', Configuration::WALLET_ADDRESS)
            );
        }
    }

    private function getMailerDsn(string $username, string $password, string $host, int $port): string
    {
        return sprintf('smtp://%s:%s@%s:%d', urldecode($username), urldecode($password), urlencode($host), $port);
    }
}
