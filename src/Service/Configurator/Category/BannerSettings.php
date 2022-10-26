<?php

namespace App\Service\Configurator\Category;

use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\AppConfig;
use App\Exception\InvalidArgumentException;
use App\Repository\ConfigurationRepository;
use App\Service\DataCollector;
use App\Utility\ArrayUtils;
use App\Utility\FormatUtils;

class BannerSettings implements ConfiguratorCategory
{
    public function __construct(
        private readonly ConfigurationRepository $repository,
        private readonly DataCollector $dataCollector,
    ) {
    }

    public function process(array $content): array
    {
        $fields = self::fields();
        $input = ArrayUtils::filterByKeys($content, $fields);
        if (empty($input)) {
            throw new InvalidArgumentException('Data is required');
        }
        ArrayUtils::assurePositiveIntegerTypesForFields($input, $fields);
        $this->validateMaximalLimit($input);

        return $this->dataCollector->push($input);
    }

    private function validateMaximalLimit(array $input): void
    {
        $uploadFileLimit = $this->repository->fetchValueByEnum(AppConfig::UploadFileLimit);
        if (null === $uploadFileLimit) {
            return;
        }
        foreach ($input as $field => $value) {
            if ($value > $uploadFileLimit) {
                throw new InvalidArgumentException(
                    sprintf('Field `%s` must not exceed limit of %s', $field, FormatUtils::sizeFormat($uploadFileLimit))
                );
            }
        }
    }

    private static function fields(): array
    {
        return [
            AdServerConfig::UploadLimitImage->name,
            AdServerConfig::UploadLimitModel->name,
            AdServerConfig::UploadLimitVideo->name,
            AdServerConfig::UploadLimitZip->name,
        ];
    }
}
