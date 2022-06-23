<?php

namespace App\Service\Installer\Step;

use App\Entity\Configuration;
use App\Repository\ConfigurationRepository;
use App\ValueObject\AccountId;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class WalletStep implements InstallerStep
{
    private const FIELDS = [
        Configuration::WALLET_ADDRESS,
        Configuration::WALLET_SECRET_KEY,
    ];

    private ConfigurationRepository $repository;

    public function __construct(ConfigurationRepository $repository)
    {
        $this->repository = $repository;
    }

    public function process(array $content): void
    {
        $this->validate($content);

        $data = [];
        foreach (self::FIELDS as $field) {
            $data[$field] = strtoupper($content[$field]);
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
        if (1 !== preg_match('/^[0-9A-F]{64}$/i', $content[Configuration::WALLET_SECRET_KEY])) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a hexadecimal string of 64 characters', Configuration::WALLET_SECRET_KEY)
            );
        }
        if (
            !is_string($content[Configuration::WALLET_ADDRESS]) ||
            !AccountId::isValid($content[Configuration::WALLET_ADDRESS])
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid ADS account', Configuration::WALLET_ADDRESS)
            );
        }
    }

    public function getName(): string
    {
        return Configuration::INSTALLER_STEP_WALLET;
    }

    public function fetchData(): array
    {
        return $this->repository->fetchValuesByNames([
            Configuration::WALLET_ADDRESS,
        ]);
    }
}
