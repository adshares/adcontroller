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
    public const INSTALLER_STEP_STATUS = 'status';

    public const DEFAULT_ADPANEL_HOST_PREFIX = 'panel';
    public const DEFAULT_ADSERVER_HOST_PREFIX = 'app';
    public const DEFAULT_ADUSER_HOST_PREFIX = 'au';

    public const BASE_ADPANEL_HOST_PREFIX = 'base_adpanel_host_prefix';
    public const BASE_ADSERVER_HOST_PREFIX = 'base_adserver_host_prefix';
    public const BASE_ADUSER_HOST_PREFIX = 'base_aduser_host_prefix';
    public const BASE_ADSERVER_NAME = 'base_adserver_name';
    public const BASE_CONTACT_EMAIL = 'base_contact_email';
    public const BASE_DOMAIN = 'base_domain';
    public const BASE_SUPPORT_EMAIL = 'base_support_email';
    public const CLASSIFIER_API_KEY_NAME = 'classifier_ext_api_key_name';
    public const CLASSIFIER_API_KEY_SECRET = 'classifier_ext_api_key_secret';
    public const COMMON_DATA_REQUIRED = 'data_required';
    public const LICENSE_DATA = 'license_data';
    public const LICENSE_KEY = 'license_key';
    public const SMTP_EMAIL_SENT = 'smtp_email_sent';
    public const SMTP_HOST = 'smtp_host';
    public const SMTP_PASSWORD = 'smtp_password';
    public const SMTP_PORT = 'smtp_port';
    public const SMTP_SENDER = 'smtp_sender';
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
