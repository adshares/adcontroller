<?php

namespace App\Service\Configurator\Category;

use App\Entity\Asset;
use App\Entity\Enum\RebrandingConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\AssetRepository;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class PanelAssets implements ConfiguratorCategory
{
    private const MAXIMAL_FILE_SIZE = 512 * 1024;

    public function __construct(private readonly AssetRepository $assetRepository)
    {
    }

    public function process(array $content): void
    {
        $this->validate($content);
        $this->store($content);
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
                $expectedHeight = (int)substr($fileId, strlen('LogoH'));
                if ($height !== $expectedHeight) {
                    throw new InvalidArgumentException(
                        sprintf('File `%s` must be %d pixels high', $fileId, $expectedHeight)
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
            $asset->setModule(RebrandingConfig::MODULE);
            $asset->setName($filename);
            $asset->setMimeType($file->getMimeType());
            $asset->setContent($file->getContent());
            $assets[] = $asset;
        }
        $this->assetRepository->upsert($assets, true);
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
            RebrandingConfig::LogoH30->name,
            RebrandingConfig::LogoH60->name,
            RebrandingConfig::LogoH90->name,
        ];
    }

    private static function fieldsFavicon(): array
    {
        return [
            RebrandingConfig::Favicon16x16->name,
            RebrandingConfig::Favicon32x32->name,
            RebrandingConfig::Favicon48x48->name,
            RebrandingConfig::Favicon96x96->name,
        ];
    }
}
