<?php

namespace App\Service\Installer\Step;

interface InstallerStep
{
    public function fetchData(): array;

    public function getName(): string;

    public function isDataRequired(): bool;

    public function process(array $content): void;
}
