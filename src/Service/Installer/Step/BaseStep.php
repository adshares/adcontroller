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
    private const DEFAULT_ADSERVER_NAME = 'AdServer';
    private const DEFAULT_MAIL_ENDING = '@example.com';
    private const FIELDS = [
        Configuration::BASE_ADPANEL_HOST_PREFIX,
        Configuration::BASE_ADSERVER_HOST_PREFIX,
        Configuration::BASE_ADSERVER_NAME,
        Configuration::BASE_ADUSER_HOST_PREFIX,
        Configuration::BASE_DOMAIN,
        Configuration::BASE_SUPPORT_EMAIL,
        Configuration::BASE_TECHNICAL_EMAIL,
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
                Configuration::BASE_ADSERVER_NAME => $content[Configuration::BASE_ADSERVER_NAME],
                Configuration::BASE_ADSERVER_URL => $adServerUrl,
                Configuration::BASE_ADUSER_INTERNAL_URL => $adUserInternalUrl,
                Configuration::BASE_ADUSER_URL => $adUserUrl,
                Configuration::BASE_SUPPORT_EMAIL => $content[Configuration::BASE_SUPPORT_EMAIL],
                Configuration::BASE_TECHNICAL_EMAIL => $content[Configuration::BASE_TECHNICAL_EMAIL],
            ]
        );

        $envEditor->set(
            [
                EnvEditor::ADSERVER_APP_HOST => $adServerHost,
                EnvEditor::ADSERVER_APP_NAME => $content[Configuration::BASE_ADSERVER_NAME],
                EnvEditor::ADSERVER_APP_URL => $adServerUrl,
            ]
        );

        $data = [];
        foreach (self::FIELDS as $field) {
            $data[$field] = $content[$field];
        }
        $data[Configuration::BASE_ADPANEL_URL] = $adPanelUrl;
        $data[Configuration::BASE_ADUSER_INTERNAL_URL] = $adUserInternalUrl;
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

        if (!filter_var($content[Configuration::BASE_TECHNICAL_EMAIL], FILTER_VALIDATE_EMAIL)) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be an email', Configuration::BASE_TECHNICAL_EMAIL)
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
