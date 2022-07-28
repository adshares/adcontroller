<?php

declare(strict_types=1);

namespace App\ValueObject;

use DateTimeImmutable;
use DateTimeInterface;

class License
{
    public function __construct(
        private readonly string $type,
        private readonly int $status,
        private readonly DateTimeInterface $dateStart,
        private readonly DateTimeInterface $dateEnd,
        private readonly string $owner,
        private readonly AccountId $paymentAddress,
        private readonly string $paymentMessage,
        private readonly float $fixedFee,
        private readonly float $demandFee,
        private readonly float $supplyFee,
        private readonly bool $privateLabel
    ) {
    }

    public function isValid(): bool
    {
        return (new DateTimeImmutable())->getTimestamp() < $this->dateEnd->getTimestamp();
    }

    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'status' => $this->status,
            'date_start' => $this->dateStart->format(DateTimeInterface::ATOM),
            'date_end' => $this->dateEnd->format(DateTimeInterface::ATOM),
            'owner' => $this->owner,
            'payment_address' => $this->paymentAddress->toString(),
            'payment_message' => $this->paymentMessage,
            'fixed_fee' => $this->fixedFee,
            'demand_fee' => $this->demandFee,
            'supply_fee' => $this->supplyFee,
            'private_label' => $this->privateLabel,
        ];
    }
}
