<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdPanel;
use App\Entity\Enum\AdServer;
use App\Entity\Enum\AdUser;
use App\Entity\Enum\App;
use App\Entity\Enum\General;
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
        AdPanel::BASE_ADPANEL_HOST_PREFIX,
        AdServer::BASE_ADSERVER_HOST_PREFIX,
        AdServer::BASE_ADSERVER_NAME,
        AdUser::BASE_ADUSER_HOST_PREFIX,
        General::BASE_DOMAIN,
        General::BASE_SUPPORT_EMAIL,
        General::BASE_TECHNICAL_EMAIL,
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
            $this->repository->insertOrUpdateOne(App::INSTALLER_STEP, $this->getName());
            return;
        }

        $this->validate($content);
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));

        $domain = $content[General::BASE_DOMAIN->value];
        $adServerHost = self::getPrefixedHost($domain, $content[AdServer::BASE_ADSERVER_HOST_PREFIX->value]);
        $adPanelHost = self::getPrefixedHost($domain, $content[AdPanel::BASE_ADPANEL_HOST_PREFIX->value]);
        $adUserHost = self::getPrefixedHost($domain, $content[AdUser::BASE_ADUSER_HOST_PREFIX->value]);
        $protocol = 'https://';
        $adServerUrl = $protocol . $adServerHost;
        $adPanelUrl = $protocol . $adPanelHost;
        $adUserUrl = $protocol . $adUserHost;
        $adUserInternalUrl = 'http://' . $adUserHost;

        $this->adServerConfigurationClient->store(
            [
                AdServer::BASE_ADSERVER_NAME->value => $content[AdServer::BASE_ADSERVER_NAME->value],
                AdServer::BASE_ADSERVER_URL->value => $adServerUrl,
                General::BASE_SUPPORT_EMAIL->value => $content[General::BASE_SUPPORT_EMAIL->value],
                General::BASE_TECHNICAL_EMAIL->value => $content[General::BASE_TECHNICAL_EMAIL->value],
            ]
        );
        $this->adServerConfigurationClient->setupAdPanel($adPanelUrl);
        $this->adServerConfigurationClient->setupAdUser($adUserUrl, $adUserInternalUrl);

        $envEditor->set(
            [
                EnvEditor::ADSERVER_APP_HOST => $adServerHost,
                EnvEditor::ADSERVER_APP_NAME => $content[AdServer::BASE_ADSERVER_NAME->value],
                EnvEditor::ADSERVER_APP_URL => $adServerUrl,
            ]
        );

        $this->repository->insertOrUpdate(
            AdPanel::MODULE,
            [
                AdPanel::BASE_ADPANEL_HOST_PREFIX->value => $content[AdPanel::BASE_ADPANEL_HOST_PREFIX->value],
                AdPanel::BASE_ADPANEL_URL->value => $adPanelUrl,
            ]
        );
        $this->repository->insertOrUpdate(
            AdServer::MODULE,
            [
                AdServer::BASE_ADSERVER_HOST_PREFIX->value => $content[AdServer::BASE_ADSERVER_HOST_PREFIX->value],
                AdServer::BASE_ADSERVER_NAME->value => $content[AdServer::BASE_ADSERVER_NAME->value],
                AdServer::BASE_ADSERVER_URL->value => $adServerUrl,
            ]
        );
        $this->repository->insertOrUpdate(
            AdUser::MODULE,
            [
                AdUser::BASE_ADUSER_HOST_PREFIX->value => $content[AdUser::BASE_ADUSER_HOST_PREFIX->value],
                AdUser::BASE_ADUSER_INTERNAL_URL->value => $adUserInternalUrl,
                AdUser::BASE_ADUSER_URL->value => $adUserUrl,
            ]
        );
        $this->repository->insertOrUpdate(
            General::MODULE,
            [
                General::BASE_DOMAIN->value => $content[General::BASE_DOMAIN->value],
                General::BASE_SUPPORT_EMAIL->value => $content[General::BASE_SUPPORT_EMAIL->value],
                General::BASE_TECHNICAL_EMAIL->value => $content[General::BASE_TECHNICAL_EMAIL->value],
            ]
        );
        $this->repository->insertOrUpdateOne(App::INSTALLER_STEP, $this->getName());
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field->value])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }

        if (!filter_var($content[General::BASE_TECHNICAL_EMAIL->value], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', General::BASE_TECHNICAL_EMAIL->value)
            );
        }
        if (!filter_var($content[General::BASE_SUPPORT_EMAIL->value], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', General::BASE_SUPPORT_EMAIL->value)
            );
        }
        if (!filter_var($content[General::BASE_DOMAIN->value], FILTER_VALIDATE_DOMAIN)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a domain', General::BASE_DOMAIN->value)
            );
        }

        $enumPrefixes = [
            AdPanel::BASE_ADPANEL_HOST_PREFIX->value,
            AdServer::BASE_ADSERVER_HOST_PREFIX->value,
            AdUser::BASE_ADUSER_HOST_PREFIX->value,
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
        return InstallerStepEnum::BASE->value;
    }

    public function fetchData(): array
    {
        $adServerConfig = $this->repository->fetchValuesByNames(
            AdServer::MODULE,
            [
                AdServer::BASE_ADSERVER_NAME->value,
                AdServer::BASE_ADSERVER_URL->value,
            ]
        );
        $adServerUrl = $adServerConfig[AdServer::BASE_ADSERVER_URL->value] ?? 'https://app.localhost';

        $data = [
            AdPanel::BASE_ADPANEL_HOST_PREFIX->value => self::DEFAULT_ADPANEL_HOST_PREFIX,
            AdServer::BASE_ADSERVER_HOST_PREFIX->value => self::DEFAULT_ADSERVER_HOST_PREFIX,
            AdUser::BASE_ADUSER_HOST_PREFIX->value => self::DEFAULT_ADUSER_HOST_PREFIX,
        ];

        if (!str_ends_with($adServerUrl, 'localhost')) {
            $adPanelUrl = $this->repository->fetchValueByEnum(AdPanel::BASE_ADPANEL_URL) ?? 'https://panel.localhost';
            $adUserUrl = $this->repository->fetchValueByEnum(AdUser::BASE_ADUSER_URL) ?? 'https://au.localhost';
            $parsed = ServiceUrlParser::parseUrls($adPanelUrl, $adServerUrl, $adUserUrl);
            if (null !== $parsed) {
                $data = $parsed;
            }
        }

        if (
            isset($adServerConfig[AdServer::BASE_ADSERVER_NAME->value])
            && self::DEFAULT_ADSERVER_NAME !== $adServerConfig[AdServer::BASE_ADSERVER_NAME->value]
        ) {
            $data[AdServer::BASE_ADSERVER_NAME->value] = $adServerConfig[AdServer::BASE_ADSERVER_NAME->value];
        }

        $mailKeys = [
            General::BASE_SUPPORT_EMAIL->value,
            General::BASE_TECHNICAL_EMAIL->value,
        ];
        $generalConfig = $this->repository->fetchValuesByNames(General::MODULE, $mailKeys);
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
        if (null === $this->repository->fetchValueByEnum(AdPanel::BASE_ADPANEL_URL)) {
            return true;
        }

        $adServerConfig = $this->repository->fetchValuesByNames(
            AdServer::MODULE,
            [
                AdServer::BASE_ADSERVER_NAME->value,
                AdServer::BASE_ADSERVER_URL->value,
            ]
        );
        if (
            !isset($adServerConfig[AdServer::BASE_ADSERVER_NAME->value])
            || self::DEFAULT_ADSERVER_NAME === $adServerConfig[AdServer::BASE_ADSERVER_NAME->value]
            || !isset($adServerConfig[AdServer::BASE_ADSERVER_URL->value])
            || str_ends_with($adServerConfig[AdServer::BASE_ADSERVER_URL->value], 'localhost')
        ) {
            return true;
        }

        if (null === $this->repository->fetchValueByEnum(AdUser::BASE_ADUSER_URL)) {
            return true;
        }

        $mailKeys = [
            General::BASE_SUPPORT_EMAIL->value,
            General::BASE_TECHNICAL_EMAIL->value,
        ];
        $generalConfig = $this->repository->fetchValuesByNames(General::MODULE, $mailKeys);
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
