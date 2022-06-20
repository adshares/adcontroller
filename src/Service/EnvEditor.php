<?php

namespace App\Service;

use RuntimeException;

class EnvEditor
{
    private string $envFile;

    public function __construct(string $envFile)
    {
        $this->envFile = $envFile;
    }

    public function getOne(string $key): ?string
    {
        $contents = $this->getFileContents();

        if (1 !== preg_match(self::pattern($key), $contents, $matches)) {
            return null;
        }

        return explode('=', $matches[0], 2)[1] ?? null;
    }

    public function get(array $keys): array
    {
        $contents = $this->getFileContents();

        $result = [];
        foreach ($keys as $key) {
            if (1 === preg_match(self::pattern($key), $contents, $matches)) {
                $result[$key] = explode('=', $matches[0], 2)[1] ?? null;
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
            $replacement = $key . '=' . $value;
            $contents = preg_replace(self::pattern($key), $replacement, $contents, 1, $count);
            if (0 === $count) {
                $append .= "\n" . $replacement;
            }
        }

        $contents .= $append;

        file_put_contents($this->envFile, $contents);
    }

    public function setOne(string $key, string $value): void
    {
        $contents = $this->getFileContents();
        $replacement = $key . '=' . $value;

        $contents = preg_replace(self::pattern($key), $replacement, $contents, 1, $count);

        if (0 === $count) {
            file_put_contents($this->envFile, "\n" . $replacement, FILE_APPEND);
        } else {
            file_put_contents($this->envFile, $contents);
        }
    }

    private static function pattern(string $key): string
    {
        return '/^' . $key . '=.*$/m';
    }

    private function getFileContents(): string
    {
        $contents = file_get_contents($this->envFile);

        if (false === $contents) {
            throw new RuntimeException(sprintf('Cannot read file `%s`', $this->envFile));
        }

        return $contents;
    }
}
