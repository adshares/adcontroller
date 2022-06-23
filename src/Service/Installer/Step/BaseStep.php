<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\Service\EnvEditor;
use App\Service\ServicePresenceChecker;
use App\ValueObject\Module;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class BaseStep implements InstallerStep
{
    private const FIELDS = [
        Configuration::BASE_ADPANEL_HOST_PREFIX,
        Configuration::BASE_ADSERVER_HOST_PREFIX,
        Configuration::BASE_ADSERVER_NAME,
        Configuration::BASE_ADUSER_HOST_PREFIX,
        Configuration::BASE_CONTACT_EMAIL,
        Configuration::BASE_DOMAIN,
        Configuration::BASE_SUPPORT_EMAIL,
    ];

    private ConfigurationRepository $repository;
    private ServicePresenceChecker $servicePresenceChecker;

    public function __construct(ConfigurationRepository $repository, ServicePresenceChecker $servicePresenceChecker)
    {
        $this->repository = $repository;
        $this->servicePresenceChecker = $servicePresenceChecker;
    }

    public function process(array $content): void
    {
        $this->validate($content);

        $envEditor = new EnvEditor($this->servicePresenceChecker->getEnvFile(Module::adserver()));

        $domain = $content[Configuration::BASE_DOMAIN];
        $protocol = 'https://';
        $host = $content[Configuration::BASE_ADSERVER_HOST_PREFIX] . '.' . $domain;
        $adserverUrl = $protocol . $host;
        $adpanelUrl = $protocol . $content[Configuration::BASE_ADPANEL_HOST_PREFIX] . '.' . $domain;
        $aduserUrl = $protocol . $content[Configuration::BASE_ADUSER_HOST_PREFIX] . '.' . $domain;
        $aduserInternalUrl = 'http://' . $content[Configuration::BASE_ADUSER_HOST_PREFIX] . '.' . $domain;

        $envEditor->set(
            [
                EnvEditor::ADSERVER_ADPANEL_URL => $adpanelUrl,
                EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL => $content[Configuration::BASE_CONTACT_EMAIL],
                EnvEditor::ADSERVER_ADUSER_BASE_URL => $aduserUrl,
                EnvEditor::ADSERVER_ADUSER_INTERNAL_URL => $aduserInternalUrl,
                EnvEditor::ADSERVER_APP_HOST => $host,
                EnvEditor::ADSERVER_APP_NAME => $content[Configuration::BASE_ADSERVER_NAME],
                EnvEditor::ADSERVER_APP_URL => $adserverUrl,
                EnvEditor::ADSERVER_MAIL_FROM_ADDRESS => $content[Configuration::BASE_SUPPORT_EMAIL],
                EnvEditor::ADSERVER_MAIN_JS_BASE_URL => $adserverUrl,
                EnvEditor::ADSERVER_SERVE_BASE_URL => $adserverUrl,
            ]
        );

        $data = [];
        foreach (self::FIELDS as $field) {
            $data[$field] = $content[$field];
        }
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

    private static function extractHost(string $url): string
    {
        if (!str_contains($url, '//')) {
            return $url;
        }

        return explode('//', $url)[1];
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

        $adpanelHost = self::extractHost($values[EnvEditor::ADSERVER_ADPANEL_URL] ?? 'https://panel.localhost');
        $adserverHost = self::extractHost($values[EnvEditor::ADSERVER_APP_URL] ?? 'https://app.localhost');
        $aduserHost = self::extractHost($values[EnvEditor::ADSERVER_ADUSER_BASE_URL] ?? 'https://au.localhost');

        $data = [
            Configuration::BASE_ADPANEL_HOST_PREFIX => Configuration::DEFAULT_ADPANEL_HOST_PREFIX,
            Configuration::BASE_ADSERVER_HOST_PREFIX => Configuration::DEFAULT_ADSERVER_HOST_PREFIX,
            Configuration::BASE_ADUSER_HOST_PREFIX => Configuration::DEFAULT_ADUSER_HOST_PREFIX,
        ];

        if (!str_ends_with($adserverHost, 'localhost')) {
            $invertedDomains = array_map(
                fn($arr) => array_reverse(explode('.', $arr)),
                ['panel' => $adpanelHost, 'app' => $adserverHost, 'au' => $aduserHost]
            );

            $commonDomainParts = [];
            $i = 0;
            while (
                isset($invertedDomains['panel'][$i])
                && isset($invertedDomains['app'][$i])
                && isset($invertedDomains['au'][$i])
            ) {
                if (
                    $invertedDomains['panel'][$i] !== $invertedDomains['app'][$i]
                    || $invertedDomains['panel'][$i] !== $invertedDomains['au'][$i]
                ) {
                    break;
                }
                $commonDomainParts[] = $invertedDomains['panel'][$i];
                ++$i;
            }

            $offset = count($commonDomainParts);
            if ($offset > 0) {
                $prefixes = array_map(
                    fn($domains) => implode('.', array_reverse(array_slice($domains, $offset))),
                    $invertedDomains
                );

                $data = [
                    Configuration::BASE_ADPANEL_HOST_PREFIX => $prefixes['panel'],
                    Configuration::BASE_ADSERVER_HOST_PREFIX => $prefixes['app'],
                    Configuration::BASE_ADUSER_HOST_PREFIX => $prefixes['au'],
                    Configuration::BASE_DOMAIN => implode('.', array_reverse($commonDomainParts)),
                ];
            }
        }

        if (
            isset($values[EnvEditor::ADSERVER_APP_NAME])
            && 'Adshares AdServer' !== $values[EnvEditor::ADSERVER_APP_NAME]
        ) {
            $data[Configuration::BASE_ADSERVER_NAME] = $values[EnvEditor::ADSERVER_APP_NAME];
        }

        if (
            isset($values[EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL])
            && !str_ends_with($values[EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL], 'localhost')
        ) {
            $data[Configuration::BASE_CONTACT_EMAIL] = $values[EnvEditor::ADSERVER_ADSHARES_OPERATOR_EMAIL];
        }

        if (
            isset($values[EnvEditor::ADSERVER_MAIL_FROM_ADDRESS])
            && !str_ends_with($values[EnvEditor::ADSERVER_MAIL_FROM_ADDRESS], 'localhost')
        ) {
            $data[Configuration::BASE_SUPPORT_EMAIL] = $values[EnvEditor::ADSERVER_MAIL_FROM_ADDRESS];
        }

        return $data;
    }
}
