<?php

namespace App\Entity;

use App\Repository\PanelAssetRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Entity(repositoryClass: PanelAssetRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQUE_FILE_ID', columns: ['file_id'])]
#[Gedmo\Loggable]
class PanelAsset
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(name: 'file_id', length: 255)]
    #[Gedmo\Versioned]
    private ?string $fileId = null;

    #[ORM\Column(name: 'file_path', length: 255)]
    private ?string $filePath = null;

    #[ORM\Column(name: 'mime_type', length: 127)]
    private ?string $mimeType = null;

    #[ORM\Column(length: 16)]
    #[Gedmo\Versioned]
    private ?string $hash = null;

    #[ORM\Column(name: 'created_at')]
    #[Gedmo\Timestampable(on: 'create')]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'updated_at')]
    #[Gedmo\Timestampable]
    private ?DateTimeImmutable $updatedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFileId(): ?string
    {
        return $this->fileId;
    }

    public function setFileId(string $fileId): self
    {
        $this->fileId = $fileId;
        return $this;
    }

    public function getFileName(): ?string
    {
        if (null === $this->filePath) {
            return null;
        }
        if (false !== ($index = strrpos($this->filePath, '/'))) {
            return substr($this->filePath, $index + 1);
        }
        return $this->filePath;
    }

    public function getFilePath(): ?string
    {
        return $this->filePath;
    }

    public function setFilePath(string $filePath): self
    {
        $this->filePath = $filePath;
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

    public function getHash(): ?string
    {
        return $this->hash;
    }

    public function setHash(string $hash): self
    {
        $this->hash = $hash;

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
}
