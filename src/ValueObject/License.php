<?php

declare(strict_types=1);

namespace App\ValueObject;

use DateTimeInterface;

class License
{
    private string $id;
    private string $type;
    private int $status;
    private DateTimeInterface $dateStart;
    private DateTimeInterface $dateEnd;
    private string $owner;
    private AccountId $paymentAddress;
    private float $fixedFee;
    private float $demandFee;
    private float $supplyFee;
    private bool $infoBox;

    public function __construct(
        string $id,
        string $type,
        int $status,
        DateTimeInterface $dateStart,
        DateTimeInterface $dateEnd,
        string $owner,
        AccountId $paymentAddress,
        float $fixedFee,
        float $demandFee,
        float $supplyFee,
        bool $infoBox
    ) {
        $this->id = $id;
        $this->type = $type;
        $this->status = $status;
        $this->dateStart = $dateStart;
        $this->dateEnd = $dateEnd;
        $this->owner = $owner;
        $this->paymentAddress = $paymentAddress;
        $this->fixedFee = $fixedFee;
        $this->demandFee = $demandFee;
        $this->supplyFee = $supplyFee;
        $this->infoBox = $infoBox;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'dateStart' => $this->dateStart->format(DateTimeInterface::ATOM),
            'dateEnd' => $this->dateEnd->format(DateTimeInterface::ATOM),
            'owner' => $this->owner,
            'paymentAddress' => $this->paymentAddress->toString(),
            'fixedFee' => $this->fixedFee,
            'demandFee' => $this->demandFee,
            'supplyFee' => $this->supplyFee,
            'infoBox' => $this->infoBox,
        ];
    }

    public function getEndDate(): string
    {
        return $this->dateEnd->format(DateTimeInterface::ATOM);
    }

    public function getOwner(): string
    {
        return $this->owner;
    }

    public function getStartDate(): string
    {
        return $this->dateStart->format(DateTimeInterface::ATOM);
    }

    public function getType(): string
    {
        return $this->type;
    }
}
