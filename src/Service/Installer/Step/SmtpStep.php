<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdServer;
use App\Entity\Enum\App;
use App\Entity\Enum\General;
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
        General::SMTP_HOST,
        General::SMTP_PASSWORD,
        General::SMTP_PORT,
        General::SMTP_SENDER,
        General::SMTP_USERNAME,
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
            $this->repository->insertOrUpdateOne(App::INSTALLER_STEP, $this->getName());
            return;
        }

        if (null === ($sender = $this->repository->fetchValueByEnum(General::BASE_TECHNICAL_EMAIL))) {
            throw new UnprocessableEntityHttpException('Technical e-mail must be set');
        }
        if (null === ($receiver = $this->repository->fetchValueByEnum(General::BASE_SUPPORT_EMAIL))) {
            throw new UnprocessableEntityHttpException('Support e-mail must be set');
        }

        if (!isset($content[General::SMTP_PASSWORD->value]) && !$this->isDataRequired()) {
            $content[General::SMTP_PASSWORD->value] = $this->repository->fetchValueByEnum(General::SMTP_PASSWORD);
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
            General::SMTP_HOST->value => $content[General::SMTP_HOST->value],
            General::SMTP_PASSWORD->value => $content[General::SMTP_PASSWORD->value],
            General::SMTP_PORT->value => $content[General::SMTP_PORT->value],
            General::SMTP_SENDER->value => $content[General::SMTP_SENDER->value],
            General::SMTP_USERNAME->value => $content[General::SMTP_USERNAME->value],
        ];
        $this->adServerConfigurationClient->store($data);

        $this->repository->insertOrUpdate(General::MODULE, $data);
        $this->repository->insertOrUpdate(
            App::MODULE,
            [
                App::EMAIL_SENT->value => self::SUCCESS,
                App::INSTALLER_STEP->value => $this->getName(),
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
        if (!filter_var($content[General::SMTP_HOST->value], FILTER_VALIDATE_DOMAIN)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a host', General::SMTP_HOST->value)
            );
        }
        if (!filter_var($content[General::SMTP_PORT->value], FILTER_VALIDATE_INT)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an integer', General::BASE_SUPPORT_EMAIL->value)
            );
        }
    }

    private function getMailerDsn(string $username, string $password, string $host, int $port): string
    {
        return sprintf('smtp://%s:%s@%s:%d', urldecode($username), urldecode($password), urlencode($host), $port);
    }

    public function getName(): string
    {
        return InstallerStepEnum::SMTP->value;
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
            $content[General::SMTP_USERNAME->value],
            $content[General::SMTP_PASSWORD->value],
            $content[General::SMTP_HOST->value],
            (int)$content[General::SMTP_PORT->value],
        );
        $transport = Transport::fromDsn($dsn);
        return new Mailer($transport);
    }

    public function fetchData(): array
    {
        $localData = $this->repository->fetchValuesByNames(
            General::MODULE,
            [
                General::BASE_SUPPORT_EMAIL->value,
                General::BASE_TECHNICAL_EMAIL->value,
                General::SMTP_PASSWORD->value,
            ]
        );

        if (
            null === ($adServerName = $this->repository->fetchValueByEnum(AdServer::BASE_ADSERVER_NAME))
            || !isset($localData[General::BASE_SUPPORT_EMAIL->value])
            || !isset($localData[General::BASE_TECHNICAL_EMAIL->value])
        ) {
            throw new UnprocessableEntityHttpException('Base step must be completed');
        }

        if (
            isset($localData[General::SMTP_PASSWORD->value])
            && strlen($localData[General::SMTP_PASSWORD->value]) > 0
        ) {
            $password = '********';
        } else {
            $password = '';
        }

        $values = $this->adServerConfigurationClient->fetch();

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
            $data[Configuration::SMTP_SENDER] = $adServerName;
        }

        return $data;
    }

    public function isDataRequired(): bool
    {
        if (self::SUCCESS !== $this->repository->fetchValueByEnum(App::EMAIL_SENT)) {
            return true;
        }

        if (null === $this->repository->fetchValueByEnum(General::SMTP_PASSWORD)) {
            return true;
        }

        $configuration = $this->adServerConfigurationClient->fetch();
        if (!isset($configuration[Configuration::SMTP_HOST])) {
            return true;
        }

        return false;
    }
}
