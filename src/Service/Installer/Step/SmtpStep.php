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
        GeneralConfig::SMTP_HOST,
        GeneralConfig::SMTP_PASSWORD,
        GeneralConfig::SMTP_PORT,
        GeneralConfig::SMTP_SENDER,
        GeneralConfig::SMTP_USERNAME,
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
            $this->repository->insertOrUpdateOne(AppConfig::INSTALLER_STEP, $this->getName());
            return;
        }

        if (null === ($sender = $this->repository->fetchValueByEnum(GeneralConfig::BASE_TECHNICAL_EMAIL))) {
            throw new UnprocessableEntityHttpException('Technical e-mail must be set');
        }
        if (null === ($receiver = $this->repository->fetchValueByEnum(GeneralConfig::BASE_SUPPORT_EMAIL))) {
            throw new UnprocessableEntityHttpException('Support e-mail must be set');
        }

        if (!isset($content[GeneralConfig::SMTP_PASSWORD->value]) && !$this->isDataRequired()) {
            $content[GeneralConfig::SMTP_PASSWORD->value] = $this->repository->fetchValueByEnum(GeneralConfig::SMTP_PASSWORD);
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
            GeneralConfig::SMTP_HOST->value => $content[GeneralConfig::SMTP_HOST->value],
            GeneralConfig::SMTP_PASSWORD->value => $content[GeneralConfig::SMTP_PASSWORD->value],
            GeneralConfig::SMTP_PORT->value => $content[GeneralConfig::SMTP_PORT->value],
            GeneralConfig::SMTP_SENDER->value => $content[GeneralConfig::SMTP_SENDER->value],
            GeneralConfig::SMTP_USERNAME->value => $content[GeneralConfig::SMTP_USERNAME->value],
        ];
        $this->adServerConfigurationClient->store($data);

        $this->repository->insertOrUpdate(GeneralConfig::MODULE, $data);
        $this->repository->insertOrUpdate(
            AppConfig::MODULE,
            [
                AppConfig::EMAIL_SENT->value => self::SUCCESS,
                AppConfig::INSTALLER_STEP->value => $this->getName(),
            ]
        );
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field->value])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field->value));
            }
        }
        if (!filter_var($content[GeneralConfig::SMTP_HOST->value], FILTER_VALIDATE_DOMAIN)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a host', GeneralConfig::SMTP_HOST->value)
            );
        }
        if (!filter_var($content[GeneralConfig::SMTP_PORT->value], FILTER_VALIDATE_INT)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an integer', GeneralConfig::BASE_SUPPORT_EMAIL->value)
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
            $content[GeneralConfig::SMTP_USERNAME->value],
            $content[GeneralConfig::SMTP_PASSWORD->value],
            $content[GeneralConfig::SMTP_HOST->value],
            (int)$content[GeneralConfig::SMTP_PORT->value],
        );
        $transport = Transport::fromDsn($dsn);
        return new Mailer($transport);
    }

    public function fetchData(): array
    {
        $generalConfig = $this->repository->fetchValuesByNames(
            GeneralConfig::MODULE,
            [
                GeneralConfig::SMTP_HOST->value,
                GeneralConfig::SMTP_PORT->value,
                GeneralConfig::SMTP_SENDER->value,
                GeneralConfig::SMTP_USERNAME->value,
                GeneralConfig::BASE_SUPPORT_EMAIL->value,
                GeneralConfig::BASE_TECHNICAL_EMAIL->value,
                GeneralConfig::SMTP_PASSWORD->value,
            ]
        );

        if (
            null === ($adServerName = $this->repository->fetchValueByEnum(AdServerConfig::NAME))
            || !isset($generalConfig[GeneralConfig::BASE_SUPPORT_EMAIL->value])
            || !isset($generalConfig[GeneralConfig::BASE_TECHNICAL_EMAIL->value])
        ) {
            throw new UnprocessableEntityHttpException('Base step must be completed');
        }

        if (
            isset($generalConfig[GeneralConfig::SMTP_PASSWORD->value])
            && strlen($generalConfig[GeneralConfig::SMTP_PASSWORD->value]) > 0
        ) {
            $password = '********';
        } else {
            $password = '';
        }

        $data = [
            Configuration::COMMON_DATA_REQUIRED => $this->isDataRequired(),
            GeneralConfig::SMTP_HOST->value => $generalConfig[GeneralConfig::SMTP_HOST->value] ?? '',
            GeneralConfig::SMTP_PASSWORD->value => $password,
            GeneralConfig::SMTP_PORT->value => $generalConfig[GeneralConfig::SMTP_PORT->value] ?? self::DEFAULT_SMTP_PORT,
            GeneralConfig::SMTP_USERNAME->value => $generalConfig[GeneralConfig::SMTP_USERNAME->value] ?? '',
        ];

        if (
            isset($generalConfig[GeneralConfig::SMTP_SENDER->value])
            && self::DEFAULT_MAIL_SENDER !== $generalConfig[GeneralConfig::SMTP_SENDER->value]
        ) {
            $data[GeneralConfig::SMTP_SENDER->value] = $generalConfig[GeneralConfig::SMTP_SENDER->value];
        } else {
            $data[GeneralConfig::SMTP_SENDER->value] = $adServerName;
        }

        return $data;
    }

    public function isDataRequired(): bool
    {
        if (self::SUCCESS !== $this->repository->fetchValueByEnum(AppConfig::EMAIL_SENT)) {
            return true;
        }

        $requiredKeys = [
            GeneralConfig::SMTP_HOST->value,
            GeneralConfig::SMTP_PASSWORD->value,
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
