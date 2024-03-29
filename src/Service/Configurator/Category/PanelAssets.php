<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\PanelAssetConfig;
use App\Entity\PanelAsset;
use App\Exception\InvalidArgumentException;
use App\Messenger\Message\AdPanelReload;
use App\Messenger\Message\AdControllerReload;
use App\Messenger\Message\AdServerReload;
use App\Repository\ConfigurationRepository;
use App\Repository\PanelAssetRepository;
use App\Service\Env\AdPanelEnvVar;
use App\Service\Env\EnvEditorFactory;
use App\Utility\DirUtils;
use App\ValueObject\Module;
use DateTimeInterface;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Messenger\MessageBusInterface;

class PanelAssets implements ConfiguratorCategory
{
    private const ASSETS_DIRECTORY = 'var/panel-assets/';
    private const ASSETS_TMP_DIRECTORY = 'var/panel-assets-history/';
    private const FILE_CONTENT_HASH_LENGTH = 16;
    private const IMAGES_DIRECTORY = 'assets/images/';
    private const MAXIMAL_FILE_ID_LENGTH = 255 - self::FILE_CONTENT_HASH_LENGTH;
    private const MAXIMAL_FILE_SIZE = 512 * 1024;

    public function __construct(
        private readonly PanelAssetRepository $assetRepository,
        private readonly ConfigurationRepository $configurationRepository,
        private readonly EnvEditorFactory $envEditorFactory,
        private readonly LoggerInterface $logger,
        private readonly MessageBusInterface $bus,
        private readonly string $appDirectory,
    ) {
    }

    public function process(array $content): array
    {
        $this->validate($content);
        $storedAssets = $this->store($content);
        $this->deploy();

        return $storedAssets;
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
                if (!str_starts_with($mimeType, 'image/')) {
                    throw new InvalidArgumentException(sprintf('File `%s` must be an image', $fileId));
                }
                if (strlen($fileId) > self::MAXIMAL_FILE_ID_LENGTH) {
                    throw new InvalidArgumentException(
                        sprintf(
                            'File id `%s` must have at most %d characters',
                            $fileId,
                            self::MAXIMAL_FILE_ID_LENGTH
                        )
                    );
                }
                if (1 !== substr_count($file->getClientOriginalName(), '.')) {
                    throw new InvalidArgumentException(
                        sprintf('File name `%s` must have exactly one dot', $file->getClientOriginalName())
                    );
                }
                $encodedName = str_replace('.', '_', $file->getClientOriginalName());
                if ($fileId !== $encodedName) {
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
        $assetTmpDirectory = $this->getAssetTmpDirectory();

        /**
         * @var string $fileId
         * @var UploadedFile $file
         */
        foreach ($content as $fileId => $file) {
            $fileContent = $file->getContent();
            $hash = $this->computeHash($fileContent);
            if ($this->isAdPanelFileId($fileId)) {
                /** @var PanelAssetConfig $enum */
                $enum = constant(sprintf('%s::%s', PanelAssetConfig::class, $fileId));
                $filePath = $enum->filePath();
            } else {
                $filePath = self::IMAGES_DIRECTORY . $file->getClientOriginalName();
                $fileId = $file->getClientOriginalName();
            }
            if (str_starts_with($filePath, '/')) {
                $filePath = substr($filePath, 1);
            }
            if (false !== ($index = strrpos($filePath, '/'))) {
                $path = substr($filePath, 0, $index + 1);
                $directories = [
                    $assetDirectory . $path,
                    $assetTmpDirectory . $path,
                ];
                foreach ($directories as $directory) {
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                }
            }

            $fileNames = [
                $assetDirectory . $filePath,
                $assetTmpDirectory . $this->appendHashToFileName($filePath, $hash),
            ];
            foreach ($fileNames as $fileName) {
                if (false === @file_put_contents($fileName, $fileContent)) {
                    $this->logger->error(
                        sprintf('Asset (%s) cannot be saved: (%s)', $fileName, error_get_last()['message'])
                    );
                    throw new RuntimeException(sprintf('Cannot save file `%s`', $fileName));
                }
            }

            $asset = new PanelAsset();
            $asset->setFileId($fileId);
            $asset->setFilePath($filePath);
            $asset->setMimeType($file->getMimeType());
            $asset->setHash($hash);
            $assets[] = $asset;
            $storedFileIds[] = $fileId;
        }
        $this->assetRepository->upsert($assets);

        return $this->mapAssetsToArray($this->assetRepository->findByFileIds($storedFileIds));
    }

    public function list(): array
    {
        return $this->mapAssetsToArray($this->assetRepository->findAll());
    }

    private function mapAssetsToArray(array $assets): array
    {
        $result = [];
        foreach ($assets as $asset) {
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
        } else {
            $assets = $this->assetRepository->findByFileIds($fileIds);
        }
        foreach ($assets as $asset) {
            $removedFileIds[] = $asset->getFileId();
            $filesystem->remove($assetDirectory . $asset->getFilePath());
        }
        $this->assetRepository->remove($assets);
        $this->bus->dispatch(new AdPanelReload());
        $this->bus->dispatch(new AdControllerReload());
        $this->bus->dispatch(new AdServerReload());

        return $removedFileIds;
    }

    private function deploy(): void
    {
        if (false === ($directory = realpath($this->getAssetDirectory()))) {
            $this->logger->error('Cannot deploy panel assets changes');
            throw new RuntimeException('Cannot deploy changes');
        }
        $envEditor = $this->envEditorFactory->createEnvEditor(Module::AdPanel);
        $envEditor->setOne(AdPanelEnvVar::BrandAssetsDirectory->value, $directory);

        $this->bus->dispatch(new AdPanelReload());
        $this->bus->dispatch(new AdControllerReload());
        $this->bus->dispatch(new AdServerReload());
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

    public function appendHashToFileName(string $fileName, string $hash): string
    {
        if (false === ($index = strrpos($fileName, '.'))) {
            throw new InvalidArgumentException(sprintf("Filename '%s' does not contain dot", $fileName));
        }

        return substr($fileName, 0, $index + 1) . $hash . substr($fileName, $index);
    }

    public function computeHash(string $fileContent): string
    {
        return substr(sha1($fileContent), 0, self::FILE_CONTENT_HASH_LENGTH);
    }

    public function getAssetDirectory(): string
    {
        return DirUtils::canonicalize($this->appDirectory) . self::ASSETS_DIRECTORY;
    }

    public function getAssetTmpDirectory(): string
    {
        return DirUtils::canonicalize($this->appDirectory) . self::ASSETS_TMP_DIRECTORY;
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
            PanelAssetConfig::LogoSimpleH30->name,
            PanelAssetConfig::LogoDarkModeH30->name,
            PanelAssetConfig::LogoSimpleDarkModeH30->name,
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
