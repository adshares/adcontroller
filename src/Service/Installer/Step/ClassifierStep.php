<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Entity\Enum\AdClassifyConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AppConfig;
use App\Entity\Enum\GeneralConfig;
use App\Entity\Enum\InstallerStepEnum;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\AdClassifyClient;
use App\Service\AdServerConfigurationClient;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class ClassifierStep implements InstallerStep
{
    private const FIELDS = [
        AdClassifyConfig::ApiKeyName,
        AdClassifyConfig::ApiKeySecret,
    ];
    private const TRIMMED_BASE64_PATTERN = '#^[0-9A-Z+/]+$#i';

    public function __construct(
        private readonly string $adclassifyBaseUri,
        private readonly AdClassifyClient $adClassifyClient,
        private readonly AdServerConfigurationClient $adServerConfigurationClient,
        private readonly ConfigurationRepository $repository,
        private readonly LoggerInterface $logger
    ) {
    }

    public function process(array $content): void
    {
        if (empty($content) && !$this->isDataRequired()) {
            $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
            return;
        }

        if (empty($content)) {
            $apiKey = $this->getApiKeyFromClassifier();
        } else {
            $apiKey = $this->getApiKeyFromRequest($content);
        }

        $this->adServerConfigurationClient->setupAdClassify(
            $this->adclassifyBaseUri,
            $apiKey['name'],
            $apiKey['secret']
        );

        $this->repository->insertOrUpdate(
            AdClassifyConfig::MODULE,
            [
                AdClassifyConfig::ApiKeyName->name => $apiKey['name'],
                AdClassifyConfig::ApiKeySecret->name => $apiKey['secret'],
            ]
        );
        $this->repository->insertOrUpdateOne(AppConfig::InstallerStep, $this->getName());
    }

    private function getApiKeyFromClassifier(): array
    {
        if (null === ($name = $this->repository->fetchValueByEnum(AdServerConfig::Name))) {
            throw new UnprocessableEntityHttpException('AdServer\'s name must be set');
        }
        if (null === ($email = $this->repository->fetchValueByEnum(GeneralConfig::TechnicalEmail))) {
            throw new UnprocessableEntityHttpException('Technical e-mail must be set');
        }

        try {
            $apiKey = $this->adClassifyClient->createAccount($email, $name);
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        } catch (TransportExceptionInterface $exception) {
            $this->logger->critical(sprintf('AdClassify is not accessible (%s)', $exception->getMessage()));
            throw new UnprocessableEntityHttpException('AdClassify is not accessible');
        }
        return $apiKey;
    }

    private function getApiKeyFromRequest(array $content): array
    {
        $this->validate($content);
        $apiKeyName = $content[AdClassifyConfig::ApiKeyName->name];
        $apiKeySecret = $content[AdClassifyConfig::ApiKeySecret->name];
        try {
            $result = $this->adClassifyClient->validateApiKey($apiKeyName, $apiKeySecret);
        } catch (UnexpectedResponseException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        } catch (TransportExceptionInterface $exception) {
            $this->logger->critical(sprintf('AdClassify is not accessible (%s)', $exception->getMessage()));
            throw new UnprocessableEntityHttpException('AdClassify is not accessible');
        }

        if (!$result) {
            throw new UnprocessableEntityHttpException('Invalid API key');
        }

        return [
            'name' => $apiKeyName,
            'secret' => $apiKeySecret,
        ];
    }

    private function validate(array $content): void
    {
        foreach (self::FIELDS as $field) {
            if (!isset($content[$field->name])) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` is required', $field->name));
            }
            $var = $content[$field->name];
            if (1 !== preg_match(self::TRIMMED_BASE64_PATTERN, $var)) {
                throw new UnprocessableEntityHttpException(sprintf('Field `%s` must be valid', $field->name));
            }
        }
    }

    public function getName(): string
    {
        return InstallerStepEnum::Classifier->name;
    }

    public function fetchData(): array
    {
        $isDataRequired = $this->isDataRequired();

        if (
            $isDataRequired
            && (
                null === $this->repository->fetchValueByEnum(AdServerConfig::Name)
                || null === $this->repository->fetchValueByEnum(GeneralConfig::TechnicalEmail)
            )
        ) {
            throw new UnprocessableEntityHttpException('Base step must be completed');
        }

        $configuration = $this->repository->fetchValuesByNames(
            AdClassifyConfig::MODULE,
            [
                AdClassifyConfig::ApiKeyName->name,
                AdClassifyConfig::Url->name,
            ]
        );
        $configuration[Configuration::COMMON_DATA_REQUIRED] = $isDataRequired;

        return $configuration;
    }

    public function isDataRequired(): bool
    {
        $requiredKeys = [
            AdClassifyConfig::ApiKeyName->name,
            AdClassifyConfig::ApiKeySecret->name,
        ];
        $configuration = $this->repository->fetchValuesByNames(AdClassifyConfig::MODULE, $requiredKeys, true);

        foreach ($requiredKeys as $requiredKey) {
            if (!isset($configuration[$requiredKey])) {
                return true;
            }
        }

        return false;
    }
}
