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
            'Type' => $this->type,
            'Status' => $this->status,
            'DateStart' => $this->dateStart->format(DateTimeInterface::ATOM),
            'DateEnd' => $this->dateEnd->format(DateTimeInterface::ATOM),
            'Owner' => $this->owner,
            'PaymentAddress' => $this->paymentAddress->toString(),
            'PaymentMessage' => $this->paymentMessage,
            'FixedFee' => $this->fixedFee,
            'DemandFee' => $this->demandFee,
            'SupplyFee' => $this->supplyFee,
            'PrivateLabel' => $this->privateLabel,
        ];
    }
}
