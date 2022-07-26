<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\AdServerConfigurationClient;
use App\Service\EnvEditor;
use App\Service\ServicePresenceChecker;
use App\Service\ServiceUrlParser;
use App\ValueObject\Module;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class BaseStep implements InstallerStep
{
    private const DEFAULT_ENV_ADSHARES_APP_NAME = 'Adshares AdServer';
    private const FIELDS = [
        Configuration::BASE_ADPANEL_HOST_PREFIX,
        Configuration::BASE_ADSERVER_HOST_PREFIX,
        Configuration::BASE_ADSERVER_NAME,
        Configuration::BASE_ADUSER_HOST_PREFIX,
        Configuration::BASE_CONTACT_EMAIL,
        Configuration::BASE_DOMAIN,
        Configuration::BASE_SUPPORT_EMAIL,
    ];

    private AdServerConfigurationClient $adServerConfigurationClient;
    private ConfigurationRepository $repository;
    private ServicePresenceChecker $servicePresenceChecker;

    public function __construct(
        AdServerConfigurationClient $adServerConfigurationClient,
        ConfigurationRepository $repository,
        ServicePresenceChecker $servicePresenceChecker
    ) {
        $this->adServerConfigurationClient = $adServerConfigurationClient;
        $this->repository = $repository;
        $this->servicePresenceChecker = $servicePresenceChecker;
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(Configuration::INSTALLER_STEP, $this->getName());
            return;
        }

        $this->validate($content);

        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));

        $domain = $content[Configuration::BASE_DOMAIN];
        $adServerHost = self::getPrefixedHost($domain, $content[Configuration::BASE_ADSERVER_HOST_PREFIX]);
        $adPanelHost = self::getPrefixedHost($domain, $content[Configuration::BASE_ADPANEL_HOST_PREFIX]);
        $adUserHost = self::getPrefixedHost($domain, $content[Configuration::BASE_ADUSER_HOST_PREFIX]);
        $protocol = 'https://';
        $adServerUrl = $protocol . $adServerHost;
        $adPanelUrl = $protocol . $adPanelHost;
        $adUserUrl = $protocol . $adUserHost;
        $adUserInternalUrl = 'http://' . $adUserHost;

        $this->adServerConfigurationClient->store(
            [
                Configuration::BASE_ADPANEL_URL => $adPanelUrl,
                Configuration::BASE_ADUSER_URL => $adUserUrl,
                Configuration::BASE_SUPPORT_EMAIL => $content[Configuration::BASE_SUPPORT_EMAIL],
                Configuration::BASE_CONTACT_EMAIL => $content[Configuration::BASE_CONTACT_EMAIL],
            ]
        );

        $envEditor->set(
            [
                EnvEditor::ADSERVER_ADPANEL_URL => $adPanelUrl,
                EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL => $content[Configuration::BASE_CONTACT_EMAIL],
                EnvEditor::ADSERVER_ADUSER_BASE_URL => $adUserUrl,
                EnvEditor::ADSERVER_ADUSER_INTERNAL_URL => $adUserInternalUrl,
                EnvEditor::ADSERVER_APP_HOST => $adServerHost,
                EnvEditor::ADSERVER_APP_NAME => $content[Configuration::BASE_ADSERVER_NAME],
                EnvEditor::ADSERVER_APP_URL => $adServerUrl,
                EnvEditor::ADSERVER_MAIL_FROM_ADDRESS => $content[Configuration::BASE_SUPPORT_EMAIL],
                EnvEditor::ADSERVER_MAIN_JS_BASE_URL => $adServerUrl,
                EnvEditor::ADSERVER_SERVE_BASE_URL => $adServerUrl,
            ]
        );

        $data = [];
        foreach (self::FIELDS as $field) {
            $data[$field] = $content[$field];
        }
        $data[Configuration::BASE_ADPANEL_URL] = $adPanelUrl;
        $data[Configuration::BASE_ADUSER_URL] = $adUserUrl;
        $data[Configuration::INSTALLER_STEP] = $this->getName();
        $this->repository->insertOrUpdate($data);
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field));
            }
        }

        if (!filter_var($content[Configuration::BASE_CONTACT_EMAIL], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', Configuration::BASE_CONTACT_EMAIL)
            );
        }
        if (!filter_var($content[Configuration::BASE_SUPPORT_EMAIL], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', Configuration::BASE_SUPPORT_EMAIL)
            );
        }
        if (!filter_var($content[Configuration::BASE_DOMAIN], FILTER_VALIDATE_DOMAIN)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a domain', Configuration::BASE_DOMAIN)
            );
        }

        $pairs = [
            Configuration::BASE_ADPANEL_HOST_PREFIX => Configuration::BASE_ADSERVER_HOST_PREFIX,
            Configuration::BASE_ADSERVER_HOST_PREFIX => Configuration::BASE_ADUSER_HOST_PREFIX,
            Configuration::BASE_ADUSER_HOST_PREFIX => Configuration::BASE_ADPANEL_HOST_PREFIX,
        ];
        foreach ($pairs as $prefixA => $prefixB) {
            if ($content[$prefixA] === $content[$prefixB]) {
                throw new UnprocessableEntityHttpException(
                    sprintf('Field `%s` must be different than `%s', $prefixA, $prefixB)
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
        return Configuration::INSTALLER_STEP_BASE;
    }

    public function fetchData(): array
    {
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));

        $values = $envEditor->get(
            [
                EnvEditor::ADSERVER_ADPANEL_URL,
                EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL,
                EnvEditor::ADSERVER_ADUSER_BASE_URL,
                EnvEditor::ADSERVER_APP_NAME,
                EnvEditor::ADSERVER_APP_URL,
                EnvEditor::ADSERVER_MAIL_FROM_ADDRESS,
            ]
        );

        $adServerUrl = $values[EnvEditor::ADSERVER_APP_URL] ?? 'https://app.localhost';

        $data = [
            Configuration::BASE_ADPANEL_HOST_PREFIX => Configuration::DEFAULT_ADPANEL_HOST_PREFIX,
            Configuration::BASE_ADSERVER_HOST_PREFIX => Configuration::DEFAULT_ADSERVER_HOST_PREFIX,
            Configuration::BASE_ADUSER_HOST_PREFIX => Configuration::DEFAULT_ADUSER_HOST_PREFIX,
        ];

        if (!str_ends_with($adServerUrl, 'localhost')) {
            $adPanelUrl = $values[EnvEditor::ADSERVER_ADPANEL_URL] ?? 'https://panel.localhost';
            $adUserUrl = $values[EnvEditor::ADSERVER_ADUSER_BASE_URL] ?? 'https://au.localhost';
            $parsed = ServiceUrlParser::parseUrls($adPanelUrl, $adServerUrl, $adUserUrl);
            if (null !== $parsed) {
                $data = $parsed;
            }
        }

        if (
            isset($values[EnvEditor::ADSERVER_APP_NAME])
            && self::DEFAULT_ENV_ADSHARES_APP_NAME !== $values[EnvEditor::ADSERVER_APP_NAME]
        ) {
            $data[Configuration::BASE_ADSERVER_NAME] = $values[EnvEditor::ADSERVER_APP_NAME];
        }

        if (
            isset($values[EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL])
            && !str_ends_with($values[EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL], '@localhost')
        ) {
            $data[Configuration::BASE_CONTACT_EMAIL] = $values[EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL];
        }

        if (
            isset($values[EnvEditor::ADSERVER_MAIL_FROM_ADDRESS])
            && !str_ends_with($values[EnvEditor::ADSERVER_MAIL_FROM_ADDRESS], '@localhost')
        ) {
            $data[Configuration::BASE_SUPPORT_EMAIL] = $values[EnvEditor::ADSERVER_MAIL_FROM_ADDRESS];
        }

        $data[Configuration::COMMON_DATA_REQUIRED] = $this->isDataRequired();

        return $data;
    }

    public function isDataRequired(): bool
    {
        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));

        $values = $envEditor->get(
            [
                EnvEditor::ADSERVER_ADPANEL_URL,
                EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL,
                EnvEditor::ADSERVER_ADUSER_BASE_URL,
                EnvEditor::ADSERVER_APP_NAME,
                EnvEditor::ADSERVER_APP_URL,
                EnvEditor::ADSERVER_MAIL_FROM_ADDRESS,
            ]
        );

        foreach ($values as $value) {
            if (!$value) {
                return true;
            }
        }

        return self::DEFAULT_ENV_ADSHARES_APP_NAME === $values[EnvEditor::ADSERVER_APP_NAME]
            || str_ends_with($values[EnvEditor::ADSERVER_APP_URL], 'localhost')
            || str_ends_with($values[EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL], '@localhost')
            || str_ends_with($values[EnvEditor::ADSERVER_MAIL_FROM_ADDRESS], '@localhost');
    }
}
