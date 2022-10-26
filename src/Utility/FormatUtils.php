<?php

namespace App\Utility;

class FormatUtils
{
    public static function sizeFormat(int $bytes): string
    {
        if ($bytes < 1024) {
            return "$bytes B";
        }
        $kilobytes = (int)floor($bytes / 1024);
        if ($kilobytes < 1024) {
            return "$kilobytes KB";
        }
        $megabytes = $kilobytes / 1024;
        if ($megabytes < 1024) {
            $megabytes = $megabytes >= 10 ? (int)floor($megabytes) : ((int)floor($megabytes * 10)) / 10;
            return "$megabytes MB";
        }
        $gigabytes = $megabytes / 1024;
        $gigabytes = $gigabytes >= 10 ? (int)floor($gigabytes) : ((int)floor($gigabytes * 10)) / 10;
        return "$gigabytes GB";
    }
}
