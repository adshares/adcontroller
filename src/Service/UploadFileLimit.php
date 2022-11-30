<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class UploadFileLimit
{
    private const NGINX_CONFIGURATION = '/etc/nginx/nginx.conf';
    private const NGINX_ADSERVER_CONFIGURATION = '/etc/nginx/sites-available/adshares-adserver';

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function getLimit(): ?int
    {
        if (
            null === ($nginxLimit = $this->getNginxLimit())
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
        $postMaxSize = $this->getLimitFromPhpIni('post_max_size');
        $uploadMaxFilesize = $this->getLimitFromPhpIni('upload_max_filesize');
        if (null === $postMaxSize || null === $uploadMaxFilesize) {
            return null;
        }
        return min($postMaxSize, $uploadMaxFilesize);
    }

    private function getNginxLimit(): ?int
    {
        if (null !== ($contents = $this->getFileContents(self::NGINX_ADSERVER_CONFIGURATION))) {
            if (1 === preg_match('/client_max_body_size\s+(.*);/', $contents, $matches)) {
                return self::convertToBytes($matches[1]);
            }
        }
        if (null !== ($contents = $this->getFileContents(self::NGINX_CONFIGURATION))) {
            if (1 === preg_match('/client_max_body_size\s+(.*);/', $contents, $matches)) {
                return self::convertToBytes($matches[1]);
            }
            return self::convertToBytes('1M');
        }
        $this->logger->error('Nginx config cannot be read');
        return PHP_INT_MAX;
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

    private static function convertToBytes(string $value): ?int
    {
        $value = trim($value);
        if ('0' === $value) {
            return PHP_INT_MAX;
        }

        $number = substr($value, 0, -1);
        $unit = strtolower(substr($value, - 1));
        switch ($unit) {
            case 'k':
                $number *= 1024;
                break;
            case 'm':
                $number *= (1024 * 1024);
                break;
            case 'g':
                $number *= (1024 * 1024 * 1024);
                break;
            default:
                break;
        }

        return $number;
    }

    private function getLimitFromPhpIni(string $key): ?int
    {
        if (false === ($value = ini_get($key))) {
            $this->logger->error(sprintf('PHP %s cannot be read', $key));
            return null;
        }
        return self::convertToBytes($value);
    }
}
