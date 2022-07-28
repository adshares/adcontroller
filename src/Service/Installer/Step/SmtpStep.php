<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email;

class SmtpStep implements InstallerStep
{
    private const DEFAULT_MAIL_SENDER = 'Adshares AdServer';
    private const DEFAULT_SMTP_PORT = '587';
    private const FIELDS = [
        Configuration::SMTP_HOST,
        Configuration::SMTP_PASSWORD,
        Configuration::SMTP_PORT,
        Configuration::SMTP_SENDER,
        Configuration::SMTP_USERNAME,
    ];
    private const SUCCESS = 'OK';

    public function __construct(
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository
    ) {
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $this->getName());
            return;
        }

        if (null === ($sender = $this->repository->fetchValueByName(Configuration::BASE_TECHNICAL_EMAIL))) {
            throw new UnprocessableEntityHttpException('Technical e-mail must be set');
        }
        if (null === ($receiver = $this->repository->fetchValueByName(Configuration::BASE_SUPPORT_EMAIL))) {
            throw new UnprocessableEntityHttpException('Support e-mail must be set');
        }

        if (!isset($content[Configuration::SMTP_PASSWORD]) && !$this->isDataRequired()) {
            $content[Configuration::SMTP_PASSWORD] = $this->repository->fetchValueByName(Configuration::SMTP_PASSWORD);
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

        $this->adServerConfigurationClient->store(
            [
                Configuration::SMTP_HOST => $content[Configuration::SMTP_HOST],
                Configuration::SMTP_PASSWORD => $content[Configuration::SMTP_PASSWORD],
                Configuration::SMTP_PORT => $content[Configuration::SMTP_PORT],
                Configuration::SMTP_SENDER => $content[Configuration::SMTP_SENDER],
                Configuration::SMTP_USERNAME => $content[Configuration::SMTP_USERNAME],
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
            Configuration::BASE_SUPPORT_EMAIL,
            Configuration::BASE_TECHNICAL_EMAIL,
            Configuration::SMTP_PASSWORD,
        ]);

        if (
            !isset($localData[Configuration::BASE_ADSERVER_NAME])
            || !isset($localData[Configuration::BASE_SUPPORT_EMAIL])
            || !isset($localData[Configuration::BASE_TECHNICAL_EMAIL])
        ) {
            throw new UnprocessableEntityHttpException('Base step must be completed');
        }

        $values = $this->adServerConfigurationClient->fetch();

        if (
            isset($localData[Configuration::SMTP_PASSWORD])
            && strlen($localData[Configuration::SMTP_PASSWORD]) > 0
        ) {
            $password = '********';
        } else {
            $password = '';
        }

        $data = [
            Configuration::COMMON_DATA_REQUIRED => $this->isDataRequired(),
            Configuration::SMTP_HOST => $values[Configuration::SMTP_HOST] ?? '',
            Configuration::SMTP_PASSWORD => $password,
            Configuration::SMTP_PORT => $values[Configuration::SMTP_PORT] ?? self::DEFAULT_SMTP_PORT,
            Configuration::SMTP_USERNAME => $values[Configuration::SMTP_USERNAME] ?? '',
        ];

        if (
            isset($values[Configuration::SMTP_SENDER])
            && self::DEFAULT_MAIL_SENDER !== $values[Configuration::SMTP_SENDER]
        ) {
            $data[Configuration::SMTP_SENDER] = $values[Configuration::SMTP_SENDER];
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

        if (null === $this->repository->fetchValueByName(Configuration::SMTP_PASSWORD)) {
            return true;
        }

        $configuration = $this->adServerConfigurationClient->fetch();
        if (!isset($configuration[Configuration::SMTP_HOST])) {
            return true;
        }

        return false;
    }
}
