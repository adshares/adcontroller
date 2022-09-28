<?php

namespace App\Service\Configurator\Category;

use App\Entity\Asset;
use App\Entity\Enum\PanelAssetConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\AssetRepository;
use App\Service\Env\AdPanelEnvVar;
use App\Service\Env\EnvEditorFactory;
use App\Utility\DirUtils;
use App\ValueObject\Module;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class PanelAssets implements ConfiguratorCategory
{
    private const ASSETS_DIRECTORY = 'var/panel-assets/';
    private const MAXIMAL_FILE_SIZE = 512 * 1024;

    public function __construct(
        private readonly AssetRepository $assetRepository,
        private readonly EnvEditorFactory $envEditorFactory,
        private readonly string $appDirectory,
    ) {
    }

    public function process(array $content): array
    {
        $this->validate($content);
        $this->store($content);
        $this->deploy();

        return [];
    }

    public function validateFileId(string $fileId): void
    {
        if (!in_array($fileId, self::fields())) {
            throw new InvalidArgumentException(sprintf('File id `%s` is not supported', $fileId));
        }
    }

    private function validate(array $content): void
    {
        if (empty($content)) {
            throw new InvalidArgumentException('At least one file is required');
        }
        $fields = self::fields();
        /**
         * @var string $fileId
         * @var UploadedFile $file
         */
        foreach ($content as $fileId => $file) {
            if (!in_array($fileId, $fields)) {
                throw new InvalidArgumentException(sprintf('File id `%s` is not supported', $fileId));
            }
            $size = $file->getSize();
            if (false === $size || $size > self::MAXIMAL_FILE_SIZE) {
                throw new InvalidArgumentException(
                    sprintf('File `%s` cannot be larger than %d KB', $fileId, self::MAXIMAL_FILE_SIZE / 1024)
                );
            }
            $mimeType = $file->getMimeType();
            if (false === $mimeType || !str_starts_with($mimeType, 'image/')) {
                throw new InvalidArgumentException(sprintf('File `%s` must be an image', $fileId));
            }
            if (in_array($fileId, self::fieldsFavicon()) && 'image/png' !== $mimeType) {
                throw new InvalidArgumentException(sprintf('File `%s` must be a PNG', $fileId));
            }

            $fileInfo = getimagesize($file->getPathname());
            [$width, $height] = $fileInfo;
            if (in_array($fileId, self::fieldsFavicon())) {
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
                $expectedMinimalHeight = (int)substr($fileId, strlen('LogoH'));
                if ($height < $expectedMinimalHeight) {
                    throw new InvalidArgumentException(
                        sprintf('File `%s` must be at least %d pixels high', $fileId, $expectedMinimalHeight)
                    );
                }
            }
        }
    }

    private function store(array $content): void
    {
        $assets = [];
        /**
         * @var string $filename
         * @var UploadedFile $file
         */
        foreach ($content as $filename => $file) {
            $asset = new Asset();
            $asset->setModule(PanelAssetConfig::MODULE);
            $asset->setName($filename);
            $asset->setMimeType($file->getMimeType());
            $asset->setContent($file->getContent());
            $assets[] = $asset;
        }
        $this->assetRepository->upsert($assets);
    }

    public function remove(): void
    {
        $assets = $this->assetRepository->findBy(['module' => PanelAssetConfig::MODULE]);
        $this->assetRepository->remove($assets);
        $this->undeploy();
    }

    private function deploy(): void
    {
        $directory = DirUtils::canonicalize($this->appDirectory) . self::ASSETS_DIRECTORY;
        if (!file_exists($directory)) {
            mkdir($directory, 0777, true);
        }

        $assets = $this->assetRepository->findBy(['module' => PanelAssetConfig::MODULE]);
        foreach ($assets as $asset) {
            /** @var PanelAssetConfig $enum */
            $enum = constant(sprintf('%s::%s', PanelAssetConfig::class, $asset->getName()));
            file_put_contents($directory . $enum->file(), $asset->getContent());
        }

        $envEditor = $this->envEditorFactory->createEnvEditor(Module::AdPanel);
        $envEditor->setOne(AdPanelEnvVar::BrandAssetsDirectory->value, $directory);
    }

    private function undeploy(): void
    {
        $envEditor = $this->envEditorFactory->createEnvEditor(Module::AdPanel);
        $envEditor->setOne(AdPanelEnvVar::BrandAssetsDirectory->value, '');

        $directory = DirUtils::canonicalize($this->appDirectory) . self::ASSETS_DIRECTORY;
        (new Filesystem())->remove($directory);
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
