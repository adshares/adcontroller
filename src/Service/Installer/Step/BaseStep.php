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
    private const DEFAULT_ADSERVER_NAME = 'AdServer';
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
        $configuration = $this->adServerConfigurationClient->fetch();

        $adServerUrl = $configuration[Configuration::BASE_ADSERVER_URL] ?? 'https://app.localhost';

        $data = [
            Configuration::BASE_ADPANEL_HOST_PREFIX => Configuration::DEFAULT_ADPANEL_HOST_PREFIX,
            Configuration::BASE_ADSERVER_HOST_PREFIX => Configuration::DEFAULT_ADSERVER_HOST_PREFIX,
            Configuration::BASE_ADUSER_HOST_PREFIX => Configuration::DEFAULT_ADUSER_HOST_PREFIX,
        ];

        if (!str_ends_with($adServerUrl, 'localhost')) {
            $adPanelUrl = $configuration[Configuration::BASE_ADPANEL_URL] ?? 'https://panel.localhost';
            $adUserUrl = $configuration[Configuration::BASE_ADUSER_URL] ?? 'https://au.localhost';
            $parsed = ServiceUrlParser::parseUrls($adPanelUrl, $adServerUrl, $adUserUrl);
            if (null !== $parsed) {
                $data = $parsed;
            }
        }

        if (
            isset($configuration[Configuration::BASE_ADSERVER_NAME])
            && self::DEFAULT_ADSERVER_NAME !== $configuration[Configuration::BASE_ADSERVER_NAME]
        ) {
            $data[Configuration::BASE_ADSERVER_NAME] = $configuration[Configuration::BASE_ADSERVER_NAME];
        }

        if (
            isset($configuration[Configuration::BASE_TECHNICAL_EMAIL])
            && !str_ends_with($configuration[Configuration::BASE_TECHNICAL_EMAIL], self::DEFAULT_MAIL_ENDING)
        ) {
            $data[Configuration::BASE_TECHNICAL_EMAIL] = $configuration[Configuration::BASE_TECHNICAL_EMAIL];
        }

        if (
            isset($configuration[Configuration::BASE_SUPPORT_EMAIL])
            && !str_ends_with($configuration[Configuration::BASE_SUPPORT_EMAIL], self::DEFAULT_MAIL_ENDING)
        ) {
            $data[Configuration::BASE_SUPPORT_EMAIL] = $configuration[Configuration::BASE_SUPPORT_EMAIL];
        }

        $data[Configuration::COMMON_DATA_REQUIRED] = $this->isDataRequired();

        return $data;
    }

    public function isDataRequired(): bool
    {
        $configuration = $this->adServerConfigurationClient->fetch();
        $requiredKeys = [
            Configuration::BASE_ADPANEL_URL,
            Configuration::BASE_ADSERVER_NAME,
            Configuration::BASE_ADSERVER_URL,
            Configuration::BASE_ADUSER_URL,
            Configuration::BASE_SUPPORT_EMAIL,
            Configuration::BASE_TECHNICAL_EMAIL,
        ];

        foreach ($requiredKeys as $requiredKey) {
            if (!isset($configuration[$requiredKey])) {
                return true;
            }
        }

        return self::DEFAULT_ADSERVER_NAME === $configuration[Configuration::BASE_ADSERVER_NAME]
            || str_ends_with($configuration[Configuration::BASE_ADSERVER_URL], 'localhost')
            || str_ends_with($configuration[Configuration::BASE_TECHNICAL_EMAIL], self::DEFAULT_MAIL_ENDING)
            || str_ends_with($configuration[Configuration::BASE_SUPPORT_EMAIL], self::DEFAULT_MAIL_ENDING);
    }
}
