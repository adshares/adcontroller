<?php

namespace App\Controller;

use App\Entity\Enum\AdPanelConfig;
use App\Entity\Enum\PanelAssetConfig;
use App\Repository\AssetRepository;
use App\Repository\ConfigurationRepository;
use App\Service\Configurator\Category\PanelAssets;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/assets', name: 'assets_')]
class AssetsController extends AbstractController
{
    #[Route('/panel/{fileId}', name: 'fetch_panel', methods: ['GET'])]
    public function fetchPanelAssets(
        string $fileId,
        AssetRepository $assetRepository,
        ConfigurationRepository $configurationRepository,
        HttpClientInterface $httpClient,
        LoggerInterface $logger,
        PanelAssets $panelAssets
    ): Response {
        $panelAssets->validateFileId($fileId);
        $entity = $assetRepository->findOneBy(['module' => PanelAssetConfig::MODULE, 'name' => $fileId]);

        if (null === $entity) {
            $baseUrl = $configurationRepository->fetchValueByEnum(AdPanelConfig::Url);
            /** @var PanelAssetConfig $enum */
            $enum = constant(sprintf('%s::%s', PanelAssetConfig::class, $fileId));
            $url = self::buildUrl($baseUrl, $enum->filepath());

            try {
                $response = $httpClient->request('GET', $url);
                if (Response::HTTP_OK !== $response->getStatusCode()) {
                    $logger->error(sprintf('AdPanel respond with invalid code: %d', $response->getStatusCode()));
                    throw new NotFoundHttpException(sprintf('File `%s` not found', $fileId));
                }
            } catch (TransportExceptionInterface $exception) {
                $logger->critical(sprintf('AdPanel does not respond: %s', $exception->getMessage()));
                throw new NotFoundHttpException(sprintf('File `%s` not found', $fileId));
            }

            $content = $response->getContent();
            $mimeType = $response->getHeaders()['content-type'][0];
        } else {
            $content = stream_get_contents($entity->getContent());
            $mimeType = $entity->getMimeType();
        }

        $response = new StreamedResponse(function () use ($content) {
            echo $content;
        });
        $response->headers->set('Content-Type', $mimeType);

        return $response;
    }

    private static function buildUrl(string $baseUrl, string $filepath): string
    {
        if (str_ends_with($baseUrl, '/')) {
            $baseUrl = substr($baseUrl, 0, strlen($baseUrl) - 1);
        }
        return $baseUrl . $filepath;
    }
}
