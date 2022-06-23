<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email;

class SmtpStep implements InstallerStep
{
    private const FIELDS = [
        Configuration::SMTP_HOST,
        Configuration::SMTP_PASSWORD,
        Configuration::SMTP_PORT,
        Configuration::SMTP_USERNAME,
    ];

    private ConfigurationRepository $repository;

    public function __construct(ConfigurationRepository $repository)
    {
        $this->repository = $repository;
    }

    public function process(array $content): void
    {
        if (null === ($sender = $this->repository->fetchValueByName(Configuration::BASE_CONTACT_EMAIL))) {
            throw new UnprocessableEntityHttpException('Contact e-mail must be set');
        }
        if (null === ($receiver = $this->repository->fetchValueByName(Configuration::BASE_SUPPORT_EMAIL))) {
            throw new UnprocessableEntityHttpException('Support e-mail must be set');
        }
        $this->validate($content);

        $message = (new Email())
            ->from($sender)
            ->to($receiver)
            ->subject('Test message from AdController')
            ->text('AdServer\'s mailer is set properly.');
        $mailer = $this->setupMailer($content);
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
        foreach (self::FIELDS as $field) {
            $data[$field] = $content[$field];
        }
        $data[Configuration::INSTALLER_STEP] = $this->getName();
        $this->repository->insertOrUpdate($data);
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
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

    private function getMailerDsn(string $username, string $password, string $host, int $port): string
    {
        return sprintf('smtp://%s:%s@%s:%d', urldecode($username), urldecode($password), urlencode($host), $port);
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_SMTP;
    }

    private function setupMailer(array $content): Mailer
    {
        $dsn = $this->getMailerDsn(
            $content[Configuration::SMTP_USERNAME],
            $content[Configuration::SMTP_PASSWORD],
            $content[Configuration::SMTP_HOST],
            (int)$content[Configuration::SMTP_PORT],
        );
        $transport = Transport::fromDsn($dsn);
        return new Mailer($transport);
    }

    public function fetchData(): array
    {
        return $this->repository->fetchValuesByNames([
            Configuration::SMTP_HOST,
            Configuration::SMTP_PASSWORD,
            Configuration::SMTP_PORT,
            Configuration::SMTP_USERNAME,
        ]);
    }
}
