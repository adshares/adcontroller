<?php

namespace App\EventListener;

use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

class ExceptionSubscriber implements EventSubscriberInterface
{
    private const HEADER_JSON_CONTENT = 'application/json';

    public function __construct(private readonly LoggerInterface $logger)
    {
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
                $response = new JsonResponse([
                    'message' => $exception->getMessage(),
                    'code' => $exception->getStatusCode(),
                    'data' => [],
                ], $exception->getStatusCode(), $exception->getHeaders());
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
