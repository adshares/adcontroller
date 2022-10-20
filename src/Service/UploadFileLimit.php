<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class UploadFileLimit
{
    private const NGINX_CONFIGURATION = '/etc/nginx/sites-available/adshares-adserver';
    private const PHP_CONFIGURATION = '/etc/php/8.1/fpm/php.ini';

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function getLimit(): ?int
    {
        if (null === ($nginxLimit = $this->getNginxLimit())
            || null === ($phpLimit = $this->getPhpLimit())
            || null === ($mysqlLimit = $this->getMysqlLimit())
        ) {
            $this->logger->error('Cannot determine upload limit');
            return null;
        }
        return min($nginxLimit, $phpLimit, $mysqlLimit);
    }

    private function getMysqlLimit(): ?int
    {
        $connection = $this->entityManager->getConnection();
        $row = $connection->executeQuery("SHOW VARIABLES LIKE 'max_allowed_packet';")->fetchAssociative();
        return $row['Value'];
    }

    private function getPhpLimit(): ?int
    {
        if (null === ($contents = $this->getFileContents(self::PHP_CONFIGURATION))) {
            return null;
        }
        $postMaxSize = $this->getLimitFromPhpIni($contents, 'post_max_size');
        $uploadMaxFilesize = $this->getLimitFromPhpIni($contents, 'upload_max_filesize');
        if (null === $postMaxSize || null === $uploadMaxFilesize) {
            return null;
        }
        return min($postMaxSize, $uploadMaxFilesize);
    }

    private function getNginxLimit(): ?int
    {
        if (null === ($contents = $this->getFileContents(self::NGINX_CONFIGURATION))) {
            return null;
        }
        if (1 === preg_match('/client_max_body_size\s+(.*);/', $contents, $matches)) {
            return self::convertToBytes($matches[1]);
        }
        $this->logger->error('Nginx client_max_body_size cannot be read');
        return null;
    }

    private function getFileContents(string $fileName): ?string
    {
        if (!file_exists($fileName)) {
            $this->logger->error(sprintf('Configuration file (%s) does not exist', $fileName));
            return null;
        }
        $contents = @file_get_contents($fileName);
        if (false === $contents) {
            $this->logger->error(
                sprintf('Configuration file (%s) cannot be read: (%s)', $fileName, error_get_last()['message'])
            );
            return null;
        }

        return $contents;
    }

    private static function convertToBytes(string $size): ?int
    {
        preg_match_all('/^(\d+)(\w*)$/', $size, $matches);
        $value = (int)$matches[1][0];
        if (0 === $value) {
            return null;
        }
        $unit = strtolower($matches[2][0]);
        switch ($unit) {
            case 'k':
                $value *= 1024;
                break;
            case 'm':
                $value *= (1024 * 1024);
                break;
            case 'g':
                $value *= (1024 * 1024 * 1024);
                break;
            default:
                break;
        }
        return $value;
    }

    private function getLimitFromPhpIni(string $contents, string $key): ?int
    {
        if (1 === preg_match('/' . $key . '\s*=\s*(\S+)/', $contents, $matches)) {
            return self::convertToBytes($matches[1]);
        }
        $this->logger->error(sprintf('PHP %s cannot be read', $key));
        return null;
    }
}
