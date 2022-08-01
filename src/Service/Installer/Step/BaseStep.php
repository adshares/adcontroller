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
use App\Service\EnvEditor;
use App\Service\ServicePresenceChecker;
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
        AdPanelConfig::HOST_PREFIX,
        AdServerConfig::HOST_PREFIX,
        AdServerConfig::NAME,
        AdUserConfig::HOST_PREFIX,
        GeneralConfig::BASE_DOMAIN,
        GeneralConfig::BASE_SUPPORT_EMAIL,
        GeneralConfig::BASE_TECHNICAL_EMAIL,
    ];

    public function __construct(
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
        private readonly ServicePresenceChecker $servicePresenceChecker
    ) {
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(AppConfig::INSTALLER_STEP, $this->getName());
            return;
        }

        $this->validate($content);
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));

        $domain = $content[GeneralConfig::BASE_DOMAIN->value];
        $adServerHost = self::getPrefixedHost($domain, $content[AdServerConfig::HOST_PREFIX->value]);
        $adPanelHost = self::getPrefixedHost($domain, $content[AdPanelConfig::HOST_PREFIX->value]);
        $adUserHost = self::getPrefixedHost($domain, $content[AdUserConfig::HOST_PREFIX->value]);
        $protocol = 'https://';
        $adServerUrl = $protocol . $adServerHost;
        $adPanelUrl = $protocol . $adPanelHost;
        $adUserUrl = $protocol . $adUserHost;
        $adUserInternalUrl = 'http://' . $adUserHost;

        $this->adServerConfigurationClient->store(
            [
                AdServerConfig::NAME->value => $content[AdServerConfig::NAME->value],
                AdServerConfig::URL->value => $adServerUrl,
                GeneralConfig::BASE_SUPPORT_EMAIL->value => $content[GeneralConfig::BASE_SUPPORT_EMAIL->value],
                GeneralConfig::BASE_TECHNICAL_EMAIL->value => $content[GeneralConfig::BASE_TECHNICAL_EMAIL->value],
            ]
        );
        $this->adServerConfigurationClient->setupAdPanel($adPanelUrl);
        $this->adServerConfigurationClient->setupAdUser($adUserUrl, $adUserInternalUrl);

        $envEditor->set(
            [
                EnvEditor::ADSERVER_APP_HOST => $adServerHost,
                EnvEditor::ADSERVER_APP_NAME => $content[AdServerConfig::NAME->value],
                EnvEditor::ADSERVER_APP_URL => $adServerUrl,
            ]
        );

        $this->repository->insertOrUpdate(
            AdPanelConfig::MODULE,
            [
                AdPanelConfig::HOST_PREFIX->value => $content[AdPanelConfig::HOST_PREFIX->value],
                AdPanelConfig::URL->value => $adPanelUrl,
            ]
        );
        $this->repository->insertOrUpdate(
            AdServerConfig::MODULE,
            [
                AdServerConfig::HOST_PREFIX->value => $content[AdServerConfig::HOST_PREFIX->value],
                AdServerConfig::NAME->value => $content[AdServerConfig::NAME->value],
                AdServerConfig::URL->value => $adServerUrl,
            ]
        );
        $this->repository->insertOrUpdate(
            AdUserConfig::MODULE,
            [
                AdUserConfig::HOST_PREFIX->value => $content[AdUserConfig::HOST_PREFIX->value],
                AdUserConfig::INTERNAL_URL->value => $adUserInternalUrl,
                AdUserConfig::URL->value => $adUserUrl,
            ]
        );
        $this->repository->insertOrUpdate(
            GeneralConfig::MODULE,
            [
                GeneralConfig::BASE_DOMAIN->value => $content[GeneralConfig::BASE_DOMAIN->value],
                GeneralConfig::BASE_SUPPORT_EMAIL->value => $content[GeneralConfig::BASE_SUPPORT_EMAIL->value],
                GeneralConfig::BASE_TECHNICAL_EMAIL->value => $content[GeneralConfig::BASE_TECHNICAL_EMAIL->value],
            ]
        );
        $this->repository->insertOrUpdateOne(AppConfig::INSTALLER_STEP, $this->getName());
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field->value])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }

        if (!filter_var($content[GeneralConfig::BASE_TECHNICAL_EMAIL->value], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', GeneralConfig::BASE_TECHNICAL_EMAIL->value)
            );
        }
        if (!filter_var($content[GeneralConfig::BASE_SUPPORT_EMAIL->value], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', GeneralConfig::BASE_SUPPORT_EMAIL->value)
            );
        }
        if (!filter_var($content[GeneralConfig::BASE_DOMAIN->value], FILTER_VALIDATE_DOMAIN)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a domain', GeneralConfig::BASE_DOMAIN->value)
            );
        }

        $enumPrefixes = [
            AdPanelConfig::HOST_PREFIX->value,
            AdServerConfig::HOST_PREFIX->value,
            AdUserConfig::HOST_PREFIX->value,
        ];
        $pairs = [
            0 => 1,
            1 => 2,
            2 => 0,
        ];
        foreach ($pairs as $index1 => $index2) {
            if ($content[$enumPrefixes[$index1]] === $content[$enumPrefixes[$index2]]) {
                throw new UnprocessableEntityHttpException(
                    sprintf('Field `%s` must be different than `%s', $enumPrefixes[$index1], $enumPrefixes[$index2])
                );
            }
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
                AdServerConfig::NAME->value,
                AdServerConfig::URL->value,
            ]
        );
        $adServerUrl = $adServerConfig[AdServerConfig::URL->value] ?? 'https://app.localhost';

        $data = [
            AdPanelConfig::HOST_PREFIX->value => self::DEFAULT_ADPANEL_HOST_PREFIX,
            AdServerConfig::HOST_PREFIX->value => self::DEFAULT_ADSERVER_HOST_PREFIX,
            AdUserConfig::HOST_PREFIX->value => self::DEFAULT_ADUSER_HOST_PREFIX,
        ];

        if (!str_ends_with($adServerUrl, 'localhost')) {
            $adPanelUrl = $this->repository->fetchValueByEnum(AdPanelConfig::URL) ?? 'https://panel.localhost';
            $adUserUrl = $this->repository->fetchValueByEnum(AdUserConfig::URL) ?? 'https://au.localhost';
            $parsed = ServiceUrlParser::parseUrls($adPanelUrl, $adServerUrl, $adUserUrl);
            if (null !== $parsed) {
                $data = $parsed;
            }
        }

        if (
            isset($adServerConfig[AdServerConfig::NAME->value])
            && self::DEFAULT_ADSERVER_NAME !== $adServerConfig[AdServerConfig::NAME->value]
        ) {
            $data[AdServerConfig::NAME->value] = $adServerConfig[AdServerConfig::NAME->value];
        }

        $mailKeys = [
            GeneralConfig::BASE_SUPPORT_EMAIL->value,
            GeneralConfig::BASE_TECHNICAL_EMAIL->value,
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
        if (null === $this->repository->fetchValueByEnum(AdPanelConfig::URL)) {
            return true;
        }

        $adServerConfig = $this->repository->fetchValuesByNames(
            AdServerConfig::MODULE,
            [
                AdServerConfig::NAME->value,
                AdServerConfig::URL->value,
            ]
        );
        if (
            !isset($adServerConfig[AdServerConfig::NAME->value])
            || self::DEFAULT_ADSERVER_NAME === $adServerConfig[AdServerConfig::NAME->value]
            || !isset($adServerConfig[AdServerConfig::URL->value])
            || str_ends_with($adServerConfig[AdServerConfig::URL->value], 'localhost')
        ) {
            return true;
        }

        if (null === $this->repository->fetchValueByEnum(AdUserConfig::URL)) {
            return true;
        }

        $mailKeys = [
            GeneralConfig::BASE_SUPPORT_EMAIL->value,
            GeneralConfig::BASE_TECHNICAL_EMAIL->value,
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
