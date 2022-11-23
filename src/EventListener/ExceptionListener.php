<?php

namespace App\EventListener;

use App\Entity\Enum\AdPanelConfig;
use App\Repository\ConfigurationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

class ExceptionListener implements EventSubscriberInterface
{
    private const HEADER_JSON_CONTENT = 'application/json';

    public function __construct(
        private readonly ConfigurationRepository $configurationRepository,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function onKernelException(ExceptionEvent $event)
    {
        $exception = $event->getThrowable();
        $request = $event->getRequest();

        if (
            str_starts_with($request->getPathInfo(), '/api/') ||
            self::HEADER_JSON_CONTENT === $request->headers->get('Content-Type')
        ) {
            if ($exception instanceof HttpExceptionInterface) {
                $statusCode = $exception->getStatusCode();
                $headers = $exception->getHeaders();
                if (Response::HTTP_FORBIDDEN === $statusCode) {
                    $headers['Location'] = $this->configurationRepository->fetchValueByEnum(AdPanelConfig::Url)
                        ?? $request->getSchemeAndHttpHost();
                }
                $response = new JsonResponse([
                    'message' => $exception->getMessage(),
                    'code' => $statusCode,
                    'data' => [],
                ], $statusCode, $headers);
            } else {
                $this->logger->error(
                    sprintf('Kernel exception %d (%s)', $exception->getCode(), $exception->getMessage())
                );
                $response = new JsonResponse([
                    'message' => 'Internal Server Error',
                    'code' => Response::HTTP_INTERNAL_SERVER_ERROR,
                    'data' => [],
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $response->headers->set('Content-Type', self::HEADER_JSON_CONTENT);
            $event->setResponse($response);
        }
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => [
                ['onKernelException', 1],
            ],
        ];
    }
}
