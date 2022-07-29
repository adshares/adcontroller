<?php

namespace App\Service;

use App\Entity\Enum\AdPanel;
use App\Entity\Enum\AdServer;
use App\Entity\Enum\AdUser;
use App\Entity\Enum\General;

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
                AdPanel::HOST_PREFIX->value => $prefixes['panel'],
                AdServer::HOST_PREFIX->value => $prefixes['app'],
                AdUser::HOST_PREFIX->value => $prefixes['au'],
                General::BASE_DOMAIN->value => implode('.', array_reverse($commonDomainParts)),
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
