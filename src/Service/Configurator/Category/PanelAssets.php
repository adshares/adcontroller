<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\PanelAssetConfig;
use App\Entity\PanelAsset;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Repository\PanelAssetRepository;
use App\Service\Env\AdPanelEnvVar;
use App\Service\Env\EnvEditorFactory;
use App\Utility\DirUtils;
use App\ValueObject\Module;
use DateTimeInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class PanelAssets implements ConfiguratorCategory
{
    private const ASSETS_DIRECTORY = 'var/panel-assets/';
    private const MAXIMAL_FILE_SIZE = 512 * 1024;

    public function __construct(
        private readonly PanelAssetRepository $assetRepository,
        private readonly ConfigurationRepository $configurationRepository,
        private readonly EnvEditorFactory $envEditorFactory,
        private readonly string $appDirectory,
    ) {
    }

    public function process(array $content): array
    {
        $this->validate($content);
        $storedFileIds = $this->store($content);
        $this->deploy();

        return $storedFileIds;
    }

    public function isAdPanelFileId(string $fileId): bool
    {
        return in_array($fileId, self::fields());
    }

    private function validate(array $content): void
    {
        if (empty($content)) {
            throw new InvalidArgumentException('At least one file is required');
        }
        /**
         * @var string $fileId
         * @var UploadedFile $file
         */
        foreach ($content as $fileId => $file) {
            $size = $file->getSize();
            if (false === $size || $size > self::MAXIMAL_FILE_SIZE) {
                throw new InvalidArgumentException(
                    sprintf('File `%s` cannot be larger than %d KB', $fileId, self::MAXIMAL_FILE_SIZE / 1024)
                );
            }
            $mimeType = $file->getMimeType();
            if (false === $mimeType) {
                throw new InvalidArgumentException(sprintf('File `%s` must have a known MIME type', $fileId));
            }

            if (in_array($fileId, self::fieldsFavicon())) {
                if ('image/png' !== $mimeType) {
                    throw new InvalidArgumentException(sprintf('File `%s` must be a PNG', $fileId));
                }
                $fileInfo = getimagesize($file->getPathname());
                [$width, $height] = $fileInfo;
                [$expectedWidth, $expectedHeight] = array_map(
                    fn($item) => (int)$item,
                    explode('x', substr($fileId, strlen('Favicon')))
                );
                if ($width !== $expectedWidth) {
                    throw new InvalidArgumentException(
                        sprintf('File `%s` must be %d pixels wide', $fileId, $expectedWidth)
                    );
                }
                if ($height !== $expectedHeight) {
                    throw new InvalidArgumentException(
                        sprintf('File `%s` must be %d pixels high', $fileId, $expectedHeight)
                    );
                }
            } elseif (in_array($fileId, self::fieldsLogo())) {
                if (!str_starts_with($mimeType, 'image/')) {
                    throw new InvalidArgumentException(sprintf('File `%s` must be an image', $fileId));
                }
                $fileInfo = getimagesize($file->getPathname());
                $height = $fileInfo[1];
                $expectedMinimalHeight = (int)substr($fileId, strlen('LogoH'));
                if ($height < $expectedMinimalHeight) {
                    throw new InvalidArgumentException(
                        sprintf('File `%s` must be at least %d pixels high', $fileId, $expectedMinimalHeight)
                    );
                }
            } else {
                if (!str_starts_with($mimeType, 'image/') && 'text/plain' !== $mimeType) {
                    throw new InvalidArgumentException(sprintf('File `%s` must be an image or text', $fileId));
                }
                $encodedName = str_replace('.', '_', $file->getClientOriginalName());
                if (!str_ends_with($fileId, $encodedName)) {
                    throw new InvalidArgumentException(sprintf('File id `%s` must match uploaded file', $fileId));
                }
            }
        }
    }

    private function store(array $content): array
    {
        $assets = [];
        $storedFileIds = [];
        $assetDirectory = $this->getAssetDirectory();
        if (!file_exists($assetDirectory)) {
            mkdir($assetDirectory, 0777, true);
        }

        /**
         * @var string $fileId
         * @var UploadedFile $file
         */
        foreach ($content as $fileId => $file) {
            if ($this->isAdPanelFileId($fileId)) {
                /** @var PanelAssetConfig $enum */
                $enum = constant(sprintf('%s::%s', PanelAssetConfig::class, $fileId));
                $filePath = $enum->filePath();
            } else {
                $fileName = $file->getClientOriginalName();
                $fileId = substr($fileId, 0, -strlen($fileName)) . $fileName;
                $filePath = $fileId;
            }
            if (str_starts_with($filePath, '/')) {
                $filePath = substr($filePath, 1);
            }
            if (false !== ($index = strrpos($filePath, '/'))) {
                $directory = $assetDirectory . substr($filePath, 0, $index + 1);
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
            }

            file_put_contents($assetDirectory . $filePath, $file->getContent());

            $asset = new PanelAsset();
            $asset->setFileId($fileId);
            $asset->setFilePath($filePath);
            $asset->setMimeType($file->getMimeType());
            $assets[] = $asset;
            $storedFileIds[] = $fileId;
        }
        $this->assetRepository->upsert($assets);

        return $storedFileIds;
    }

    public function list(): array
    {
        $result = [];
        foreach ($this->assetRepository->findAll() as $asset) {
            $result[] = [
                'fileId' => $asset->getFileId(),
                'fileName' => $asset->getFileName(),
                'url' => $this->buildUrl($asset->getFilePath()),
                'createdAt' => $asset->getCreatedAt()->format(DateTimeInterface::ATOM),
                'updatedAt' => $asset->getUpdatedAt()->format(DateTimeInterface::ATOM),
            ];
        }
        return $result;
    }

    public function remove(?array $fileIds): array
    {
        $removedFileIds = [];
        $assetDirectory = $this->getAssetDirectory();
        $filesystem = new Filesystem();
        if (null === $fileIds) {
            $assets = $this->assetRepository->findAll();
            $this->assetRepository->remove($assets);

            foreach ($assets as $asset) {
                $removedFileIds[] = $asset->getFileId();
            }
        } else {
            $assets = $this->assetRepository->findByFileIds($fileIds);
            $this->assetRepository->remove($assets);

            foreach ($assets as $asset) {
                $removedFileIds[] = $asset->getFileId();
                $filesystem->remove($assetDirectory . $asset->getFileId());
            }
        }

        if (0 === $this->assetRepository->count([])) {
            $filesystem->remove($assetDirectory);
            $this->undeploy();
        }

        return $removedFileIds;
    }

    private function deploy(): void
    {
        $envEditor = $this->envEditorFactory->createEnvEditor(Module::AdPanel);
        $envEditor->setOne(AdPanelEnvVar::BrandAssetsDirectory->value, $this->getAssetDirectory());
    }

    private function undeploy(): void
    {
        $envEditor = $this->envEditorFactory->createEnvEditor(Module::AdPanel);
        $envEditor->setOne(AdPanelEnvVar::BrandAssetsDirectory->value, '');
    }

    public function buildUrl(string $filePath): string
    {
        $baseUrl = $this->configurationRepository->fetchValueByEnum(AdPanelConfig::Url);
        if (str_ends_with($baseUrl, '/')) {
            $baseUrl = substr($baseUrl, 0, strlen($baseUrl) - 1);
        }
        if (str_starts_with($filePath, '/')) {
            $filePath = substr($filePath, 1);
        }
        return sprintf('%s/%s', $baseUrl, $filePath);
    }

    public function getAssetDirectory(): string
    {
        return DirUtils::canonicalize($this->appDirectory) . self::ASSETS_DIRECTORY;
    }

    private static function fields(): array
    {
        return array_merge(
            self::fieldsLogo(),
            self::fieldsFavicon(),
        );
    }

    private static function fieldsLogo(): array
    {
        return [
            PanelAssetConfig::LogoH30->name,
            PanelAssetConfig::LogoH60->name,
            PanelAssetConfig::LogoH90->name,
        ];
    }

    private static function fieldsFavicon(): array
    {
        return [
            PanelAssetConfig::Favicon16x16->name,
            PanelAssetConfig::Favicon32x32->name,
            PanelAssetConfig::Favicon48x48->name,
            PanelAssetConfig::Favicon96x96->name,
        ];
    }
}
