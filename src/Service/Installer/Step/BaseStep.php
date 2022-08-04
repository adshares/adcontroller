<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AdUserConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\GeneralConfig;
use App\Entity\Enum\InstallerStepEnum;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Service\Env\AdServerEnvVar;
use App\Service\Env\EnvEditorFactory;
use App\Service\ServiceUrlParser;
use App\ValueObject\Module;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class BaseStep implements InstallerStep
{
    private const DEFAULT_ADPANEL_HOST_PREFIX = 'panel';
    private const DEFAULT_ADSERVER_HOST_PREFIX = 'app';
    private const DEFAULT_ADSERVER_NAME = 'AdServer';
    private const DEFAULT_ADUSER_HOST_PREFIX = 'au';
    private const DEFAULT_MAIL_ENDING = '@example.com';
    private const FIELDS = [
        AdServerConfig::Name,
        GeneralConfig::Domain,
        GeneralConfig::SupportEmail,
        GeneralConfig::TechnicalEmail,
    ];

    public function __construct(
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
        private readonly EnvEditorFactory $envEditorFactory,
    ) {
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
            return;
        }

        $this->validate($content);
        $envEditor = $this->envEditorFactory->createEnvEditor(Module::AdServer);

        $domain = $content[GeneralConfig::Domain->name];
        $adServerHost = self::getPrefixedHost($domain, self::DEFAULT_ADSERVER_HOST_PREFIX);
        $adPanelHost = self::getPrefixedHost($domain, self::DEFAULT_ADPANEL_HOST_PREFIX);
        $adUserHost = self::getPrefixedHost($domain, self::DEFAULT_ADUSER_HOST_PREFIX);
        $protocol = 'https://';
        $adServerUrl = $protocol . $adServerHost;
        $adPanelUrl = $protocol . $adPanelHost;
        $adUserUrl = $protocol . $adUserHost;
        $adUserInternalUrl = 'http://' . $adUserHost;

        $this->adServerConfigurationClient->store(
            [
                AdServerConfig::Name->name => $content[AdServerConfig::Name->name],
                AdServerConfig::Url->name => $adServerUrl,
                GeneralConfig::SupportEmail->name => $content[GeneralConfig::SupportEmail->name],
                GeneralConfig::TechnicalEmail->name => $content[GeneralConfig::TechnicalEmail->name],
            ]
        );
        $this->adServerConfigurationClient->setupAdPanel($adPanelUrl);
        $this->adServerConfigurationClient->setupAdUser($adUserUrl, $adUserInternalUrl);

        $envEditor->set(
            [
                AdServerEnvVar::AppHost->value => $adServerHost,
                AdServerEnvVar::AppName->value => $content[AdServerConfig::Name->name],
                AdServerEnvVar::AppUrl->value => $adServerUrl,
            ]
        );

        $this->repository->insertOrUpdateOne(AdPanelConfig::Url, $adPanelUrl);
        $this->repository->insertOrUpdate(
            AdServerConfig::MODULE,
            [
                AdServerConfig::Name->name => $content[AdServerConfig::Name->name],
                AdServerConfig::Url->name => $adServerUrl,
            ]
        );
        $this->repository->insertOrUpdate(
            AdUserConfig::MODULE,
            [
                AdUserConfig::InternalUrl->name => $adUserInternalUrl,
                AdUserConfig::Url->name => $adUserUrl,
            ]
        );
        $this->repository->insertOrUpdate(
            GeneralConfig::MODULE,
            [
                GeneralConfig::Domain->name => $content[GeneralConfig::Domain->name],
                GeneralConfig::SupportEmail->name => $content[GeneralConfig::SupportEmail->name],
                GeneralConfig::TechnicalEmail->name => $content[GeneralConfig::TechnicalEmail->name],
            ]
        );
        $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field->name])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field->name));
            }
        }

        if (!filter_var($content[GeneralConfig::TechnicalEmail->name], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', GeneralConfig::TechnicalEmail->name)
            );
        }
        if (!filter_var($content[GeneralConfig::SupportEmail->name], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', GeneralConfig::SupportEmail->name)
            );
        }
        if (!filter_var($content[GeneralConfig::Domain->name], FILTER_VALIDATE_DOMAIN)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a domain', GeneralConfig::Domain->name)
            );
        }
    }

    private static function getPrefixedHost(string $domain, string $prefix): string
    {
        return ('' === $prefix ? '' : $prefix . '.') . $domain;
    }

    public function getName(): string
    {
        return InstallerStepEnum::Base->name;
    }

    public function fetchData(): array
    {
        $adServerConfig = $this->repository->fetchValuesByNames(
            AdServerConfig::MODULE,
            [
                AdServerConfig::Name->name,
                AdServerConfig::Url->name,
            ]
        );
        $adServerUrl = $adServerConfig[AdServerConfig::Url->name] ?? 'https://app.localhost';

        $data = [
        ];

        if (!str_ends_with($adServerUrl, 'localhost')) {
            $adPanelUrl = $this->repository->fetchValueByEnum(AdPanelConfig::Url) ?? 'https://panel.localhost';
            $adUserUrl = $this->repository->fetchValueByEnum(AdUserConfig::Url) ?? 'https://au.localhost';
            $parsed = ServiceUrlParser::parseUrls($adPanelUrl, $adServerUrl, $adUserUrl);
            if (null !== $parsed) {
                $data[GeneralConfig::Domain->name] = $parsed[GeneralConfig::Domain->name];
            }
        }

        if (
            isset($adServerConfig[AdServerConfig::Name->name])
            && self::DEFAULT_ADSERVER_NAME !== $adServerConfig[AdServerConfig::Name->name]
        ) {
            $data[AdServerConfig::Name->name] = $adServerConfig[AdServerConfig::Name->name];
        }

        $mailKeys = [
            GeneralConfig::SupportEmail->name,
            GeneralConfig::TechnicalEmail->name,
        ];
        $generalConfig = $this->repository->fetchValuesByNames(GeneralConfig::MODULE, $mailKeys);
        foreach ($mailKeys as $mailKey) {
            if (
                isset($generalConfig[$mailKey])
                && !str_ends_with($generalConfig[$mailKey], self::DEFAULT_MAIL_ENDING)
            ) {
                $data[$mailKey] = $generalConfig[$mailKey];
            }
        }

        $data[Configuration::COMMON_DATA_REQUIRED] = $this->isDataRequired();

        return $data;
    }

    public function isDataRequired(): bool
    {
        if (null === $this->repository->fetchValueByEnum(AdPanelConfig::Url)) {
            return true;
        }

        $adServerConfig = $this->repository->fetchValuesByNames(
            AdServerConfig::MODULE,
            [
                AdServerConfig::Name->name,
                AdServerConfig::Url->name,
            ]
        );
        if (
            !isset($adServerConfig[AdServerConfig::Name->name])
            || self::DEFAULT_ADSERVER_NAME === $adServerConfig[AdServerConfig::Name->name]
            || !isset($adServerConfig[AdServerConfig::Url->name])
            || str_ends_with($adServerConfig[AdServerConfig::Url->name], 'localhost')
        ) {
            return true;
        }

        if (null === $this->repository->fetchValueByEnum(AdUserConfig::Url)) {
            return true;
        }

        $mailKeys = [
            GeneralConfig::SupportEmail->name,
            GeneralConfig::TechnicalEmail->name,
        ];
        $generalConfig = $this->repository->fetchValuesByNames(GeneralConfig::MODULE, $mailKeys);
        foreach ($mailKeys as $mailKey) {
            if (
                !isset($generalConfig[$mailKey])
                || str_ends_with($generalConfig[$mailKey], self::DEFAULT_MAIL_ENDING)
            ) {
                return true;
            }
        }

        return false;
    }
}
