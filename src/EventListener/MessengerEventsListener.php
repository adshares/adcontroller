<?php

namespace App\EventListener;

use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Messenger\Event\SendMessageToTransportsEvent;
use Symfony\Component\Messenger\Event\WorkerMessageFailedEvent;
use Symfony\Component\Messenger\Event\WorkerMessageHandledEvent;
use Symfony\Component\Messenger\Event\WorkerMessageReceivedEvent;

#[AsEventListener]
class MessengerEventsListener implements EventSubscriberInterface
{
    public function __construct(private readonly LoggerInterface $logger)
    {
    }

    public function onSendMessageToTransportsEvent(SendMessageToTransportsEvent $event): void
    {
        $this->logger->info('onSendMessageToTransportsEvent');
    }

    public function onWorkerMessageReceivedEvent(WorkerMessageReceivedEvent $event): void
    {
        $this->logger->info('onWorkerMessageReceivedEvent');
    }

    public function onWorkerMessageFailedEvent(WorkerMessageFailedEvent $event): void
    {
        $this->logger->info('onWorkerMessageFailedEvent');
    }

    public function onWorkerMessageHandledEvent(WorkerMessageHandledEvent $event): void
    {
        $this->logger->info('onWorkerMessageHandledEvent');
    }

    public static function getSubscribedEvents(): array
    {
        return [
            SendMessageToTransportsEvent::class => ['onSendMessageToTransportsEvent'],
            WorkerMessageReceivedEvent::class => ['onWorkerMessageReceivedEvent'],
            WorkerMessageFailedEvent::class => ['onWorkerMessageFailedEvent'],
            WorkerMessageHandledEvent::class => ['onWorkerMessageHandledEvent'],
        ];
    }
}
