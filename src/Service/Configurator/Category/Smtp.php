<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AppConfig;
use App\Entity\Enum\GeneralConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email;

class Smtp implements ConfiguratorCategory
{
    public const EMAIL_SUCCESS = 'OK';

    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly DataCollector $dataCollector,
    ) {
    }

    public function process(array $content): array
    {
        $input = ArrayUtils::filterByKeys($content, self::fields());
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }

        if (null === ($sender = $this->repository->fetchValueByEnum(GeneralConfig::TechnicalEmail))) {
            throw new InvalidArgumentException('Technical e-mail must be set');
        }
        if (null === ($receiver = $this->repository->fetchValueByEnum(GeneralConfig::SupportEmail))) {
            throw new InvalidArgumentException('Support e-mail must be set');
        }
        $changePassword = true;
        if (!isset($input[GeneralConfig::SmtpPassword->name])) {
            $changePassword = false;
            $input[GeneralConfig::SmtpPassword->name] = $this->repository->fetchValueByEnum(
                GeneralConfig::SmtpPassword
            );
        }
        $this->validate($input);
        $this->sendTestEmailMessage($this->setupMailer($input), $this->createTestEmailMessage($sender, $receiver));
        $this->repository->insertOrUpdateOne(AppConfig::EmailSent, self::EMAIL_SUCCESS);
        if ($changePassword) {
            $this->repository->insertOrUpdateOne(
                GeneralConfig::SmtpPassword,
                $input[GeneralConfig::SmtpPassword->name]
            );
        }
        return $this->dataCollector->push($input);
    }

    private function validate(array $content): void
    {
        foreach (self::fields() as $field) {
            if (!isset($content[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
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

    private function sendTestEmailMessage(Mailer $mailer, Email $message): void {
        $timeout = ini_get('default_socket_timeout');
        ini_set('default_socket_timeout', 10);
        try {
            $mailer->send($message);
        } catch (TransportExceptionInterface $exception) {
            throw new UnprocessableEntityHttpException(sprintf('Invalid configuration: %s', $exception->getMessage()));
        } finally {
            ini_set('default_socket_timeout', $timeout);
        }
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
            $content[GeneralConfig::SmtpUsername->name],
            $content[GeneralConfig::SmtpPassword->name],
            $content[GeneralConfig::SmtpHost->name],
            (int)$content[GeneralConfig::SmtpPort->name],
        );
        $transport = Transport::fromDsn($dsn);
        return new Mailer($transport);
    }

    private function getMailerDsn(string $username, string $password, string $host, int $port): string
    {
        return sprintf('smtp://%s:%s@%s:%d', urlencode($username), urlencode($password), urlencode($host), $port);
    }

    private static function fields(): array
    {
        return [
            GeneralConfig::SmtpHost->name,
            GeneralConfig::SmtpPassword->name,
            GeneralConfig::SmtpPort->name,
            GeneralConfig::SmtpSender->name,
            GeneralConfig::SmtpUsername->name,
        ];
    }
}
