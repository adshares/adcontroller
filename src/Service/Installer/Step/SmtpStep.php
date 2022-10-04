<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\GeneralConfig;
use App\Entity\Enum\InstallerStepEnum;
use App\Repository\ConfigurationRepository;
use App\Service\Configurator\Category\Smtp;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SmtpStep implements InstallerStep
{
    private const DEFAULT_MAIL_SENDER = 'Adshares AdServer';
    private const DEFAULT_SMTP_PORT = '587';

    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly Smtp $smtp,
    ) {
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
            return;
        }
        $this->smtp->process($content);
        $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
    }

    public function getName(): string
    {
        return InstallerStepEnum::Smtp->name;
    }

    public function fetchData(): array
    {
        $generalConfig = $this->repository->fetchValuesByNames(
            GeneralConfig::MODULE,
            [
                GeneralConfig::SmtpHost->name,
                GeneralConfig::SmtpPassword->name,
                GeneralConfig::SmtpPort->name,
                GeneralConfig::SmtpSender->name,
                GeneralConfig::SmtpUsername->name,
                GeneralConfig::SupportEmail->name,
                GeneralConfig::TechnicalEmail->name,
            ],
            true
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
        if (Smtp::EMAIL_SUCCESS !== $this->repository->fetchValueByEnum(AppConfig::EmailSent)) {
            return true;
        }

        $requiredKeys = [
            GeneralConfig::SmtpHost->name,
            GeneralConfig::SmtpPassword->name,
        ];
        $configuration = $this->repository->fetchValuesByNames(GeneralConfig::MODULE, $requiredKeys, true);

        foreach ($requiredKeys as $requiredKey) {
            if (!isset($configuration[$requiredKey])) {
                return true;
            }
        }

        return false;
    }
}
