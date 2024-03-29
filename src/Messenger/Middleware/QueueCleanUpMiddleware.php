<?php

namespace App\Messenger\Middleware;

use App\Messenger\Message\AdPanelReload;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception\TableNotFoundException;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\Middleware\MiddlewareInterface;
use Symfony\Component\Messenger\Middleware\StackInterface;
use Symfony\Component\Messenger\Stamp\ReceivedStamp;
use Symfony\Component\Messenger\Transport\Serialization\SerializerInterface;

class QueueCleanUpMiddleware implements MiddlewareInterface
{
    private const QUEUE_NAME = 'default';

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
        private readonly SerializerInterface $serializer,
    ) {
    }

    public function handle(Envelope $envelope, StackInterface $stack): Envelope
    {
        if (
            $envelope->getMessage() instanceof AdPanelReload
            && null === $envelope->last(ReceivedStamp::class)
        ) {
            $this->cleanUpAdPanelReloadMessages();
        }

        return $stack->next()->handle($envelope, $stack);
    }

    private function cleanUpAdPanelReloadMessages(): void
    {
        $connection = $this->entityManager->getConnection();
        try {
            $rows = $connection->executeQuery(
                'SELECT * FROM messenger_messages WHERE queue_name = :queue_name AND delivered_at IS NULL',
                ['queue_name' => self::QUEUE_NAME]
            )->fetchAllAssociative();
        } catch (TableNotFoundException) {
            return;
        }

        $idsToDelete = [];
        foreach ($rows as $row) {
            $envelope = $this->serializer->decode([
                'body' => $row['body'],
                'headers' => $row['headers'],
            ]);
            if ($envelope->getMessage() instanceof AdPanelReload) {
                $this->logger->info('AdPanelReload present is DB');
                $idsToDelete[] = $row['id'];
            }
        }
        if ($idsToDelete) {
            $deleted = $connection->executeStatement(
                'DELETE FROM messenger_messages WHERE id IN (?)',
                [$idsToDelete],
                [Connection::PARAM_INT_ARRAY]
            );
            $this->logger->info(sprintf('Removed %d messages', $deleted));
        }
    }
}
