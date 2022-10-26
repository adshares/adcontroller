<?php

namespace App\EventListener;

use App\Messenger\Message\AdServerUpdateSiteRank;
use App\Messenger\Message\AdUserFetchPageData;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Messenger\Event\SendMessageToTransportsEvent;
use Symfony\Component\Messenger\Event\WorkerMessageFailedEvent;
use Symfony\Component\Messenger\Event\WorkerMessageHandledEvent;
use Symfony\Component\Messenger\Event\WorkerMessageReceivedEvent;
use Symfony\Component\Messenger\MessageBusInterface;

#[AsEventListener]
class MessengerEventsListener implements EventSubscriberInterface
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly MessageBusInterface $bus,
    ) {
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
        if ($event->getEnvelope()->getMessage() instanceof AdUserFetchPageData) {
            $this->bus->dispatch(new AdServerUpdateSiteRank());
        }
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
