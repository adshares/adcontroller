<?php

namespace App\Service\Configurator\Category;

interface ConfiguratorCategory
{
    public function process(array $content): void;
}
