<?php

namespace App\Utility;

class DirUtils
{
    public static function canonicalize(string $directory): string
    {
        if (!str_ends_with($directory, '/')) {
            return $directory . '/';
        }
        return $directory;
    }
}
