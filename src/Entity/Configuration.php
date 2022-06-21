<?php

namespace App\Entity;

use App\Repository\ConfigurationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ConfigurationRepository::class)]
class Configuration
{
    public const APP_STATE = 'app_state';
    public const APP_STATE_ADSERVER_ACCOUNT_CREATED = 'adserver_account_created';
    public const APP_STATE_INSTALLATION_COMPLETED = 'installation_completed';

    public const INSTALLER_STEP = 'installer_step';
    public const INSTALLER_STEP_BASE = 'base';
    public const INSTALLER_STEP_DNS = 'dns';
    public const INSTALLER_STEP_WALLET = 'wallet';
    public const INSTALLER_STEP_LICENSE = 'license';
    public const INSTALLER_STEP_CLASSIFIER = 'classifier';
    public const INSTALLER_STEP_SMTP = 'smtp';

    public const BASE_ADSERVER_NAME = 'base_adserver_name';
    public const BASE_CONTACT_EMAIL = 'base_contact_email';
    public const BASE_DOMAIN = 'base_domain';
    public const BASE_SUPPORT_EMAIL = 'base_support_email';
    public const LICENSE_CONTACT_EMAIL = 'license_contact_email';
    public const LICENSE_END_DATE = 'license_end_date';
    public const LICENSE_OWNER = 'license_owner';
    public const LICENSE_SECRET = 'license_secret';
    public const LICENSE_START_DATE = 'license_start_date';
    public const LICENSE_TYPE = 'license_type';
    public const SMTP_HOST = 'smtp_host';
    public const SMTP_PASSWORD = 'smtp_password';
    public const SMTP_PORT = 'smtp_port';
    public const SMTP_USERNAME = 'smtp_username';
    public const WALLET_ADDRESS = 'wallet_address';
    public const WALLET_SECRET_KEY = 'wallet_secret_key';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private $id;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    private $name;

    #[ORM\Column(type: 'string', length: 255)]
    private $value;

    #[ORM\Column(type: 'datetime_immutable')]
    private $created_at;

    #[ORM\Column(type: 'datetime_immutable')]
    private $updated_at;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(string $value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): self
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(\DateTimeImmutable $updated_at): self
    {
        $this->updated_at = $updated_at;

        return $this;
    }
}
