<?php

namespace App\Service\Env;

use Psr\Log\LoggerInterface;
use RuntimeException;

class EnvEditor
{
    public function __construct(private readonly LoggerInterface $logger, private readonly string $envFile)
    {
    }

    public function getOne(string $key): ?string
    {
        $contents = $this->getFileContents();

        if (1 !== preg_match(self::pattern($key), $contents, $matches)) {
            return null;
        }

        return self::unescapeSpecialCharacters(explode('=', $matches[0], 2)[1]);
    }

    public function get(array $keys): array
    {
        $contents = $this->getFileContents();

        $result = [];
        foreach ($keys as $key) {
            if (1 === preg_match(self::pattern($key), $contents, $matches)) {
                $result[$key] = self::unescapeSpecialCharacters(explode('=', $matches[0], 2)[1]);
            } else {
                $result[$key] = null;
            }
        }

        return $result;
    }

    public function set(array $data): void
    {
        $contents = $this->getFileContents();
        $append = '';

        foreach ($data as $key => $value) {
            $replacement = $key . '=' . self::escapeSpecialCharacters($value);
            $contents = preg_replace(self::pattern($key), $replacement, $contents, 1, $count);
            if (0 === $count) {
                $append .= "\n" . $replacement;
            }
        }

        $contents .= $append;

        if (false === @file_put_contents($this->envFile, $contents)) {
            $this->logger->error(
                sprintf('Env file (%s) cannot be saved: (%s)', $this->envFile, error_get_last()['message'])
            );
            throw new RuntimeException(sprintf('Cannot save file `%s`', $this->envFile));
        }
    }

    public function setOne(string $key, string $value): void
    {
        $contents = $this->getFileContents();
        $replacement = $key . '=' . self::escapeSpecialCharacters($value);

        $contents = preg_replace(self::pattern($key), $replacement, $contents, 1, $count);

        if (0 === $count) {
            $result = @file_put_contents($this->envFile, "\n" . $replacement, FILE_APPEND);
        } else {
            $result = @file_put_contents($this->envFile, $contents);
        }
        if (false === $result) {
            $this->logger->error(
                sprintf('Env file (%s) cannot be saved: (%s)', $this->envFile, error_get_last()['message'])
            );
            throw new RuntimeException(sprintf('Cannot save file `%s`', $this->envFile));
        }
    }

    private static function pattern(string $key): string
    {
        return '/^' . $key . '=.*$/m';
    }

    private function getFileContents(): string
    {
        $contents = @file_get_contents($this->envFile);
        if (false === $contents) {
            $this->logger->error(
                sprintf('Env file (%s) cannot be read: (%s)', $this->envFile, error_get_last()['message'])
            );
            throw new RuntimeException(sprintf('Cannot read file `%s`', $this->envFile));
        }

        return $contents;
    }

    private static function escapeSpecialCharacters(string $value): string
    {
        if (1 === preg_match('/^\d+(\.\d+)?$/', $value)) {
            return $value;
        }

        return sprintf('"%s"', str_replace('"', '\\"', str_replace('\\', '\\\\', $value)));
    }

    private static function unescapeSpecialCharacters(string $value): string
    {
        if (1 === preg_match('/^\d+(\.\d+)?$/', $value)) {
            return $value;
        }

        return str_replace('\\\\', '\\', str_replace('\\"', '"', trim($value, '"')));
    }
}
