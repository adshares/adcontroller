<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Routing\RequestContextAwareInterface;

class RouterContextSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly string $secureScheme,
        private readonly string $publicHost,
        private readonly int $publicPort,
        private readonly string $publicPath,
        private readonly RequestContextAwareInterface $router
    ) {
    }

    public function onKernelRequest(RequestEvent $event)
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $this->router->getContext()->setScheme($this->secureScheme);
        $this->router->getContext()->setHost($this->publicHost);
        $this->router->getContext()->setHttpPort($this->publicPort);
        $this->router->getContext()->setHttpsPort($this->publicPort);
        $this->router->getContext()->setBaseUrl($this->publicPath);
    }

    public static function getSubscribedEvents()
    {
        return [KernelEvents::REQUEST => 'onKernelRequest'];
    }
}
