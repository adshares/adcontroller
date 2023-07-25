<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Exception\InvalidArgumentException;
use App\Messenger\Message\AdServerReloadDefaultSupplyPlaceholders;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use App\Utility\DirUtils;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Messenger\MessageBusInterface;

class SupplyPlaceholderSeed implements ConfiguratorCategory
{
    private const ASSETS_DIRECTORY = 'var/panel-assets/';
    private const ASSETS_TMP_DIRECTORY = 'var/panel-assets-history/';
    private const COLOR_PATTERN = '/^[\da-z]+$/i';
    private const FILE_CONTENT_HASH_LENGTH = 16;
    private const MAXIMAL_FILE_SIZE = 512 * 1024;

    public function __construct(
        private readonly DataCollector $dataCollector,
        private readonly LoggerInterface $logger,
        private readonly MessageBusInterface $bus,
        private readonly string $appDirectory,
    ) {
    }

    public function process(array $content): array
    {
        $input = ArrayUtils::filterByKeys($content, self::fields());

        $this->validate($input);
        $path = $this->store($input);

        $result = $this->dataCollector->push([
            AdServerConfig::SupplyPlaceholderColor->name => $input['color'],
            AdServerConfig::SupplyPlaceholderFile->name => $path,
        ]);

        $this->deploy();

        return $result;
    }

    private function validate(array $input): void
    {
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }
        foreach (self::fields() as $field) {
            if (!isset($input[$field])) {
                throw new InvalidArgumentException(sprintf('Field `%s` is required', $field));
            }
        }

        if (1 !== preg_match(self::COLOR_PATTERN, $input['color'])) {
            throw new InvalidArgumentException('Field `color` must be hexadecimal string');
        }

        /** @var UploadedFile $file */
        $file = $input['seed'];
        $size = $file->getSize();
        if (false === $size || $size > self::MAXIMAL_FILE_SIZE) {
            throw new InvalidArgumentException(
                sprintf('Seed file cannot be larger than %d KB', self::MAXIMAL_FILE_SIZE / 1024)
            );
        }

        $mimeType = $file->getMimeType();
        if (false === $mimeType || !str_starts_with($mimeType, 'image/')) {
            throw new InvalidArgumentException('Seed file must be an image');
        }
    }

    private function store(array $input): string
    {
        $assetDirectory = $this->getAssetDirectory();
        $assetTmpDirectory = $this->getAssetTmpDirectory();

        /** @var UploadedFile $file */
        $file = $input['seed'];
        $seedFileName = sprintf('seed.%s', explode('/', $file->getMimeType())[1]);
        $fileContent = $file->getContent();

        $fileNames = [
            $assetDirectory . $seedFileName,
            $assetTmpDirectory . $this->appendHashToFileName($seedFileName, $this->computeHash($fileContent)),
        ];
        foreach ($fileNames as $fileName) {
            if (false === @file_put_contents($fileName, $fileContent)) {
                $this->logger->error(
                    sprintf('Asset (%s) cannot be saved: (%s)', $fileName, error_get_last()['message'])
                );
                throw new RuntimeException(sprintf('Cannot save file `%s`', $fileName));
            }
        }

        return $fileNames[0];
    }

    private function deploy(): void
    {
        $this->bus->dispatch(new AdServerReloadDefaultSupplyPlaceholders());
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
        return ['color', 'seed'];
    }
}
