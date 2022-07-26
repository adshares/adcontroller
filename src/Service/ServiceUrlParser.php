<?php

namespace App\Service;

use App\Entity\Configuration;

class ServiceUrlParser
{
    public static function parseUrls(string $adPanelUrl, string $adServerUrl, string $adUserUrl): ?array
    {
        $adpanelHost = self::extractHost($adPanelUrl);
        $adserverHost = self::extractHost($adServerUrl);
        $aduserHost = self::extractHost($adUserUrl);

        $invertedDomains = array_map(
            fn($arr) => array_reverse(explode('.', $arr)),
            ['panel' => $adpanelHost, 'app' => $adserverHost, 'au' => $aduserHost]
        );

        $commonDomainParts = [];
        $i = 0;
        while (
            isset($invertedDomains['panel'][$i])
            && isset($invertedDomains['app'][$i])
            && isset($invertedDomains['au'][$i])
        ) {
            if (
                $invertedDomains['panel'][$i] !== $invertedDomains['app'][$i]
                || $invertedDomains['panel'][$i] !== $invertedDomains['au'][$i]
            ) {
                break;
            }
            $commonDomainParts[] = $invertedDomains['panel'][$i];
            ++$i;
        }

        $offset = count($commonDomainParts);
        if ($offset > 0) {
            $prefixes = array_map(
                fn($domains) => implode('.', array_reverse(array_slice($domains, $offset))),
                $invertedDomains
            );

            return [
                Configuration::BASE_ADPANEL_HOST_PREFIX => $prefixes['panel'],
                Configuration::BASE_ADSERVER_HOST_PREFIX => $prefixes['app'],
                Configuration::BASE_ADUSER_HOST_PREFIX => $prefixes['au'],
                Configuration::BASE_DOMAIN => implode('.', array_reverse($commonDomainParts)),
            ];
        }

        return null;
    }

    private static function extractHost(string $url): string
    {
        if (!str_contains($url, '//')) {
            return $url;
        }

        return explode('//', $url)[1];
    }
}
