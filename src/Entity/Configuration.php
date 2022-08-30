<?php

namespace App\Entity;

use App\Repository\ConfigurationRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Entity(repositoryClass: ConfigurationRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQUE_NAME', columns: ['module', 'name'])]
#[Gedmo\Loggable]
#[Gedmo\SoftDeleteable(fieldName: 'deletedAt')]
class Configuration
{
    public const COMMON_DATA_REQUIRED = 'DataRequired';
    public const LICENSE_DATA = 'LicenseData';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 31)]
    private ?string $module = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Gedmo\Versioned]
    private ?string $value = null;

    #[ORM\Column(name: 'created_at')]
    #[Gedmo\Timestampable(on: 'create')]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'updated_at')]
    #[Gedmo\Timestampable]
    private ?DateTimeImmutable $updatedAt = null;

    #[ORM\Column(name: 'deleted_at', nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getModule(): ?string
    {
        return $this->module;
    }

    public function setModule(string $module): self
    {
        $this->module = $module;
        return $this;
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

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?DateTimeImmutable $deletedAt): self
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    public function restore(): self
    {
        $this->deletedAt = null;
        return $this;
    }
}
