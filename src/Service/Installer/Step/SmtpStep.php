<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\EnvEditor;
use App\Service\ServicePresenceChecker;
use App\ValueObject\Module;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email;

class SmtpStep implements InstallerStep
{
    private const DEFAULT_ENV_ADSHARES_MAIL_FROM_NAME = 'Adshares AdServer';
    private const FIELDS = [
        Configuration::SMTP_HOST,
        Configuration::SMTP_PASSWORD,
        Configuration::SMTP_PORT,
        Configuration::SMTP_SENDER,
        Configuration::SMTP_USERNAME,
    ];
    private const SUCCESS = 'OK';

    private ConfigurationRepository $repository;
    private EnvEditor $envEditor;
    private ServicePresenceChecker $servicePresenceChecker;

    public function __construct(ConfigurationRepository $repository, ServicePresenceChecker $servicePresenceChecker)
    {
        $this->repository = $repository;
        $this->servicePresenceChecker = $servicePresenceChecker;
        $this->envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $this->getName());
            return;
        }

        if (null === ($sender = $this->repository->fetchValueByName(Configuration::BASE_CONTACT_EMAIL))) {
            throw new UnprocessableEntityHttpException('Contact e-mail must be set');
        }
        if (null === ($receiver = $this->repository->fetchValueByName(Configuration::BASE_SUPPORT_EMAIL))) {
            throw new UnprocessableEntityHttpException('Support e-mail must be set');
        }

        if (!isset($content[Configuration::SMTP_PASSWORD]) && !$this->isDataRequired()) {
            $content[Configuration::SMTP_PASSWORD] = $this->envEditor->getOne(EnvEditor::ADSERVER_MAIL_PASSWORD);
        }
        $this->validate($content);

        $message = $this->createTestEmailMessage($sender, $receiver);
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

        $this->envEditor->set(
            [
                EnvEditor::ADSERVER_MAIL_FROM_NAME => $content[Configuration::SMTP_SENDER],
                EnvEditor::ADSERVER_MAIL_HOST => $content[Configuration::SMTP_HOST],
                EnvEditor::ADSERVER_MAIL_PASSWORD => $content[Configuration::SMTP_PASSWORD],
                EnvEditor::ADSERVER_MAIL_PORT => $content[Configuration::SMTP_PORT],
                EnvEditor::ADSERVER_MAIL_USERNAME => $content[Configuration::SMTP_USERNAME],
            ]
        );

        $data = [
            Configuration::SMTP_EMAIL_SENT => self::SUCCESS,
            Configuration::INSTALLER_STEP => $this->getName(),
        ];
        foreach (self::FIELDS as $field) {
            $data[$field] = $content[$field];
        }
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

    private function createTestEmailMessage(?string $sender, ?string $receiver): Email
    {
        return (new Email())
            ->from($sender)
            ->to($receiver)
            ->subject('Test message from AdController')
            ->text('AdServer\'s mailer is set properly.');
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
        $localData = $this->repository->fetchValuesByNames([
            Configuration::BASE_ADSERVER_NAME,
            Configuration::BASE_CONTACT_EMAIL,
            Configuration::BASE_SUPPORT_EMAIL,
        ]);

        if (
            !isset($localData[Configuration::BASE_ADSERVER_NAME])
            || !isset($localData[Configuration::BASE_CONTACT_EMAIL])
            || !isset($localData[Configuration::BASE_SUPPORT_EMAIL])
        ) {
            throw new UnprocessableEntityHttpException('Base step must be completed');
        }

        $values = $this->envEditor->get(
            [
                EnvEditor::ADSERVER_MAIL_FROM_NAME,
                EnvEditor::ADSERVER_MAIL_HOST,
                EnvEditor::ADSERVER_MAIL_PASSWORD,
                EnvEditor::ADSERVER_MAIL_PORT,
                EnvEditor::ADSERVER_MAIL_USERNAME,
            ]
        );

        if (
            isset($values[EnvEditor::ADSERVER_MAIL_PASSWORD])
            && strlen($values[EnvEditor::ADSERVER_MAIL_PASSWORD]) > 0
        ) {
            $password = '********';
        } else {
            $password = '';
        }

        $data = [
            Configuration::COMMON_DATA_REQUIRED => $this->isDataRequired(),
            Configuration::SMTP_HOST => $values[EnvEditor::ADSERVER_MAIL_HOST] ?? '',
            Configuration::SMTP_PASSWORD => $password,
            Configuration::SMTP_PORT => $values[EnvEditor::ADSERVER_MAIL_PORT] ?? '587',
            Configuration::SMTP_USERNAME => $values[EnvEditor::ADSERVER_MAIL_USERNAME] ?? '',
        ];


        if (
            isset($values[EnvEditor::ADSERVER_MAIL_FROM_NAME])
            && self::DEFAULT_ENV_ADSHARES_MAIL_FROM_NAME !== $values[EnvEditor::ADSERVER_MAIL_FROM_NAME]
        ) {
            $data[Configuration::SMTP_SENDER] = $values[EnvEditor::ADSERVER_MAIL_FROM_NAME];
        } else {
            $data[Configuration::SMTP_SENDER] = $localData[Configuration::BASE_ADSERVER_NAME];
        }

        return $data;
    }

    public function isDataRequired(): bool
    {
        if (self::SUCCESS !== $this->repository->fetchValueByName(Configuration::SMTP_EMAIL_SENT)) {
            return true;
        }

        if (!$this->envEditor->getOne(EnvEditor::ADSERVER_MAIL_HOST)) {
            return true;
        }

        return false;
    }
}
