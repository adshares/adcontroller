<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\GeneralConfig;
use App\Entity\Enum\InstallerStepEnum;
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
        GeneralConfig::SmtpHost,
        GeneralConfig::SmtpPassword,
        GeneralConfig::SmtpPort,
        GeneralConfig::SmtpSender,
        GeneralConfig::SmtpUsername,
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
            $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
            return;
        }

        if (null === ($sender = $this->repository->fetchValueByEnum(GeneralConfig::TechnicalEmail))) {
            throw new UnprocessableEntityHttpException('Technical e-mail must be set');
        }
        if (null === ($receiver = $this->repository->fetchValueByEnum(GeneralConfig::SupportEmail))) {
            throw new UnprocessableEntityHttpException('Support e-mail must be set');
        }

        if (!isset($content[GeneralConfig::SmtpPassword->name]) && !$this->isDataRequired()) {
            $content[GeneralConfig::SmtpPassword->name] = $this->repository->fetchValueByEnum(GeneralConfig::SmtpPassword);
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

        $data = [
            GeneralConfig::SmtpHost->name => $content[GeneralConfig::SmtpHost->name],
            GeneralConfig::SmtpPassword->name => $content[GeneralConfig::SmtpPassword->name],
            GeneralConfig::SmtpPort->name => $content[GeneralConfig::SmtpPort->name],
            GeneralConfig::SmtpSender->name => $content[GeneralConfig::SmtpSender->name],
            GeneralConfig::SmtpUsername->name => $content[GeneralConfig::SmtpUsername->name],
        ];
        $this->adServerConfigurationClient->store($data);

        $this->repository->insertOrUpdate(GeneralConfig::MODULE, $data);
        $this->repository->insertOrUpdate(
            AppConfig::MODULE,
            [
                AppConfig::EmailSent->name => self::SUCCESS,
                AppConfig::InstallerStep->name => $this->getName(),
            ]
        );
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field->name])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field->name));
            }
        }
        if (!filter_var($content[GeneralConfig::SmtpHost->name], FILTER_VALIDATE_DOMAIN)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a host', GeneralConfig::SmtpHost->name)
            );
        }
        if (!filter_var($content[GeneralConfig::SmtpPort->name], FILTER_VALIDATE_INT)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an integer', GeneralConfig::SupportEmail->name)
            );
        }
    }

    private function getMailerDsn(string $username, string $password, string $host, int $port): string
    {
        return sprintf('smtp://%s:%s@%s:%d', urldecode($username), urldecode($password), urlencode($host), $port);
    }

    public function getName(): string
    {
        return InstallerStepEnum::Smtp->name;
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
            urlencode($content[GeneralConfig::SmtpUsername->name]),
            urlencode($content[GeneralConfig::SmtpPassword->name]),
            $content[GeneralConfig::SmtpHost->name],
            (int)$content[GeneralConfig::SmtpPort->name],
        );
        $transport = Transport::fromDsn($dsn);
        return new Mailer($transport);
    }

    public function fetchData(): array
    {
        $generalConfig = $this->repository->fetchValuesByNames(
            GeneralConfig::MODULE,
            [
                GeneralConfig::SmtpHost->name,
                GeneralConfig::SmtpPort->name,
                GeneralConfig::SmtpSender->name,
                GeneralConfig::SmtpUsername->name,
                GeneralConfig::SupportEmail->name,
                GeneralConfig::TechnicalEmail->name,
                GeneralConfig::SmtpPassword->name,
            ]
        );

        if (
            null === ($adServerName = $this->repository->fetchValueByEnum(AdServerConfig::Name))
            || !isset($generalConfig[GeneralConfig::SupportEmail->name])
            || !isset($generalConfig[GeneralConfig::TechnicalEmail->name])
        ) {
            throw new UnprocessableEntityHttpException('Base step must be completed');
        }

        if (
            isset($generalConfig[GeneralConfig::SmtpPassword->name])
            && strlen($generalConfig[GeneralConfig::SmtpPassword->name]) > 0
        ) {
            $password = '********';
        } else {
            $password = '';
        }

        $data = [
            Configuration::COMMON_DATA_REQUIRED => $this->isDataRequired(),
            GeneralConfig::SmtpHost->name => $generalConfig[GeneralConfig::SmtpHost->name] ?? '',
            GeneralConfig::SmtpPassword->name => $password,
            GeneralConfig::SmtpPort->name => $generalConfig[GeneralConfig::SmtpPort->name] ?? self::DEFAULT_SMTP_PORT,
            GeneralConfig::SmtpUsername->name => $generalConfig[GeneralConfig::SmtpUsername->name] ?? '',
        ];

        if (
            isset($generalConfig[GeneralConfig::SmtpSender->name])
            && self::DEFAULT_MAIL_SENDER !== $generalConfig[GeneralConfig::SmtpSender->name]
        ) {
            $data[GeneralConfig::SmtpSender->name] = $generalConfig[GeneralConfig::SmtpSender->name];
        } else {
            $data[GeneralConfig::SmtpSender->name] = $adServerName;
        }

        return $data;
    }

    public function isDataRequired(): bool
    {
        if (self::SUCCESS !== $this->repository->fetchValueByEnum(AppConfig::EmailSent)) {
            return true;
        }

        $requiredKeys = [
            GeneralConfig::SmtpHost->name,
            GeneralConfig::SmtpPassword->name,
        ];
        $configuration = $this->repository->fetchValuesByNames(GeneralConfig::MODULE, $requiredKeys);

        foreach ($requiredKeys as $requiredKey) {
            if (!isset($configuration[$requiredKey])) {
                return true;
            }
        }

        return false;
    }
}
