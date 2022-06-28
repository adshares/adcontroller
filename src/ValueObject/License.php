<?php

declare(strict_types=1);

namespace App\ValueObject;

use DateTimeInterface;

class License
{
    private string $type;
    private int $status;
    private DateTimeInterface $dateStart;
    private DateTimeInterface $dateEnd;
    private string $owner;
    private AccountId $paymentAddress;
    private string $paymentMessage;
    private float $fixedFee;
    private float $demandFee;
    private float $supplyFee;
    private bool $privateLabel;

    public function __construct(
        string $type,
        int $status,
        DateTimeInterface $dateStart,
        DateTimeInterface $dateEnd,
        string $owner,
        AccountId $paymentAddress,
        string $paymentMessage,
        float $fixedFee,
        float $demandFee,
        float $supplyFee,
        bool $privateLabel
    ) {
        $this->type = $type;
        $this->status = $status;
        $this->dateStart = $dateStart;
        $this->dateEnd = $dateEnd;
        $this->owner = $owner;
        $this->paymentAddress = $paymentAddress;
        $this->paymentMessage = $paymentMessage;
        $this->fixedFee = $fixedFee;
        $this->demandFee = $demandFee;
        $this->supplyFee = $supplyFee;
        $this->privateLabel = $privateLabel;
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
