<?php

namespace App\Entity;

use App\Repository\AssetRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Entity(repositoryClass: AssetRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQUE_NAME', columns: ['module', 'name'])]
#[Gedmo\SoftDeleteable(fieldName: 'deletedAt')]
class Asset
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 31)]
    private ?string $module = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(name: 'mime_type', length: 127)]
    private ?string $mimeType = null;

    #[ORM\Column(type: Types::BLOB)]
    private $content = null;

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

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function setMimeType(string $mimeType): self
    {
        $this->mimeType = $mimeType;
        return $this;
    }

    public function getContent()
    {
        return $this->content;
    }

    public function setContent($content): self
    {
        $this->content = $content;
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
