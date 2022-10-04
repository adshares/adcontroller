<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdPanelConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use Symfony\Component\Filesystem\Filesystem;

class PanelPlaceholders implements ConfiguratorCategory
{
    private const MAXIMUM_CONTENT_LENGTH = 16777210;
    private const STYLE_FILENAME = 'custom.css';

    public function __construct(
        private readonly ConfigurationRepository $configurationRepository,
        private readonly DataCollector $dataCollector,
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
            $styleCssFilename = $this->panelAssets->getAssetDirectory() . self::STYLE_FILENAME;
            if ($styleCssContent) {
                file_put_contents($styleCssFilename, $styleCssContent);
                $styleCssTmpFilename = $this->panelAssets->getAssetTmpDirectory()
                    . $this->panelAssets->appendHashToFileName(self::STYLE_FILENAME, $styleCssContent);
                file_put_contents($styleCssTmpFilename, $styleCssContent);
            } else {
                $filesystem = new Filesystem();
                if ($filesystem->exists($styleCssFilename)) {
                    $filesystem->remove($styleCssFilename);
                }
            }

            $this->configurationRepository->insertOrUpdateOne(AdPanelConfig::PlaceholderStyleCss, $styleCssContent);
            $result = [
                AdPanelConfig::MODULE => [
                    AdPanelConfig::PlaceholderStyleCss->name => $styleCssContent,
                ]
            ];
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
