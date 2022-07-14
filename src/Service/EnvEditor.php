<?php

namespace App\Service;

use RuntimeException;

class EnvEditor
{
    public const ADSERVER_ADPANEL_URL = 'ADPANEL_URL';
    public const ADSERVER_ADPAY_ENDPOINT = 'ADPAY_ENDPOINT';
    public const ADSERVER_ADSELECT_ENDPOINT = 'ADSELECT_ENDPOINT';
    public const ADSERVER_ADSHARES_ADDRESS = 'ADSHARES_ADDRESS';
    public const ADSERVER_ADSHARES_LICENSE_KEY = 'ADSHARES_LICENSE_KEY';
    public const ADSERVER_ADSHARES_OPERATOR_EMAIL = 'ADSHARES_OPERATOR_EMAIL';
    public const ADSERVER_ADSHARES_NODE_HOST = 'ADSHARES_NODE_HOST';
    public const ADSERVER_ADSHARES_NODE_PORT = 'ADSHARES_NODE_PORT';
    public const ADSERVER_ADSHARES_SECRET = 'ADSHARES_SECRET';
    public const ADSERVER_ADUSER_BASE_URL = 'ADUSER_BASE_URL';
    public const ADSERVER_ADUSER_INTERNAL_URL = 'ADUSER_INTERNAL_URL';
    public const ADSERVER_APP_HOST = 'APP_HOST';
    public const ADSERVER_APP_NAME = 'APP_NAME';
    public const ADSERVER_APP_URL = 'APP_URL';
    public const ADSERVER_CLASSIFIER_EXTERNAL_API_KEY_NAME = 'CLASSIFIER_EXTERNAL_API_KEY_NAME';
    public const ADSERVER_CLASSIFIER_EXTERNAL_API_KEY_SECRET = 'CLASSIFIER_EXTERNAL_API_KEY_SECRET';
    public const ADSERVER_CLASSIFIER_EXTERNAL_BASE_URL = 'CLASSIFIER_EXTERNAL_BASE_URL';
    public const ADSERVER_MAIL_FROM_ADDRESS = 'MAIL_FROM_ADDRESS';
    public const ADSERVER_MAIL_FROM_NAME = 'MAIL_FROM_NAME';
    public const ADSERVER_MAIL_HOST = 'MAIL_HOST';
    public const ADSERVER_MAIL_PASSWORD = 'MAIL_PASSWORD';
    public const ADSERVER_MAIL_PORT = 'MAIL_PORT';
    public const ADSERVER_MAIL_USERNAME = 'MAIL_USERNAME';
    public const ADSERVER_MAIN_JS_BASE_URL = 'MAIN_JS_BASE_URL';
    public const ADSERVER_SERVE_BASE_URL = 'SERVE_BASE_URL';

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

        file_put_contents($this->envFile, $contents);
    }

    public function setOne(string $key, string $value): void
    {
        $contents = $this->getFileContents();
        $replacement = $key . '=' . self::escapeSpecialCharacters($value);

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
