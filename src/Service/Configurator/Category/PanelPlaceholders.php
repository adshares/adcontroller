<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdPanelConfig;
use App\Exception\InvalidArgumentException;
use App\Message\AdPanelReload;
use App\Repository\ConfigurationRepository;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Messenger\MessageBusInterface;

class PanelPlaceholders implements ConfiguratorCategory
{
    private const MAXIMUM_CONTENT_LENGTH = 16777210;
    private const STYLE_FILENAME = 'custom.css';

    public function __construct(
        private readonly ConfigurationRepository $configurationRepository,
        private readonly DataCollector $dataCollector,
        private readonly MessageBusInterface $bus,
        private readonly PanelAssets $panelAssets,
    ) {
    }

    public function process(array $content): array
    {
        $fields = $this->fields();
        $input = ArrayUtils::filterByKeys($content, $fields);
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }

        $result = [];
        if (array_key_exists(AdPanelConfig::PlaceholderStyleCss->name, $input)) {
            $styleCssContent = $input[AdPanelConfig::PlaceholderStyleCss->name];
            if ($styleCssContent) {
                $file = $this->panelAssets->appendHashToFileName(
                    self::STYLE_FILENAME,
                    $this->panelAssets->computeHash($styleCssContent)
                );
                file_put_contents($this->panelAssets->getAssetDirectory() . $file, $styleCssContent);
                file_put_contents($this->panelAssets->getAssetTmpDirectory() . $file, $styleCssContent);
            } else {
                $finder = new Finder();
                $finder->files()->in($this->panelAssets->getAssetDirectory())->name('custom*.css')->depth('== 0');
                if ($finder->hasResults()) {
                    foreach ($finder as $file) {
                        $filesystem = new Filesystem();
                        $filesystem->remove($file);
                    }
                }
            }

            $this->configurationRepository->insertOrUpdateOne(AdPanelConfig::PlaceholderStyleCss, $styleCssContent);
            $result = [
                AdPanelConfig::MODULE => [
                    AdPanelConfig::PlaceholderStyleCss->name => $styleCssContent,
                ]
            ];
            $this->bus->dispatch(new AdPanelReload());
            unset($input[AdPanelConfig::PlaceholderStyleCss->name]);
        }

        foreach ($fields as $field) {
            if (
                isset($input[$field]) &&
                (!is_string($input[$field]) || strlen($input[$field]) > self::MAXIMUM_CONTENT_LENGTH)
            ) {
                throw new InvalidArgumentException(sprintf('Field `%s` must be a string', $field));
            }
        }
        return array_merge_recursive($result, $this->dataCollector->pushPlaceholders($input));
    }

    protected function fields(): array
    {
        return [
            AdPanelConfig::PlaceholderIndexDescription->name,
            AdPanelConfig::PlaceholderIndexKeywords->name,
            AdPanelConfig::PlaceholderIndexMetaTags->name,
            AdPanelConfig::PlaceholderIndexTitle->name,
            AdPanelConfig::PlaceholderLoginInfo->name,
            AdPanelConfig::PlaceholderRobotsTxt->name,
            AdPanelConfig::PlaceholderStyleCss->name,
        ];
    }
}
