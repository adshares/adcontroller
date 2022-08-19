<?php

namespace App\Repository;

use App\Entity\Configuration;
use App\Entity\Enum\AdClassifyConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\ConfigEnum;
use App\Entity\Enum\GeneralConfig;
use App\Service\Crypt;
use App\ValueObject\ConfigType;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Query\Parameter;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Configuration>
 *
 * @method Configuration|null find($id, $lockMode = null, $lockVersion = null)
 * @method Configuration|null findOneBy(array $criteria, array $orderBy = null)
 * @method Configuration[]    findAll()
 * @method Configuration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ConfigurationRepository extends ServiceEntityRepository
{
    private const SECRETS_ENUM = [
        AdClassifyConfig::ApiKeySecret,
        AdServerConfig::LicenseKey,
        AdServerConfig::WalletSecretKey,
        GeneralConfig::SmtpPassword,
    ];

    public function __construct(private readonly Crypt $crypt, ManagerRegistry $registry)
    {
        parent::__construct($registry, Configuration::class);
    }

    public function insertOrUpdateOne(ConfigEnum $enum, string $value, bool $flush = true): void
    {
        $this->insertOrUpdate($enum->getModule(), [$enum->name => $value], $flush);
    }

    public function insertOrUpdate(string $module, array $data, bool $flush = true): void
    {
        $now = new DateTimeImmutable();

        $entities = $this->findByNames($module, array_keys($data));
        $names = array_map(fn($entity) => $entity->getName(), $entities);
        $entities = array_combine($names, $entities);

        foreach ($data as $name => $value) {
            if (!isset($entities[$name])) {
                $entity = new Configuration();
                $entity->setModule($module);
                $entity->setName($name);
                $entity->setCreatedAt($now);
            } else {
                $entity = $entities[$name];
            }
            if ($this->isSecretEntity($entity)) {
                $value = $this->crypt->encrypt($value);
            }
            $entity->setValue($value);
            $entity->setUpdatedAt($now);

            $this->getEntityManager()->persist($entity);
        }

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ConfigEnum $enum, bool $flush = true): void
    {
        if (null === ($entity = $this->findOneByEnum($enum))) {
            return;
        }

        $this->getEntityManager()->remove($entity);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function fetchValueByEnum(ConfigEnum $enum): ?string
    {
        if (null === ($configuration = $this->findOneByEnum($enum))) {
            return null;
        }

        $value = $configuration->getValue();
        if (in_array($enum, self::SECRETS_ENUM)) {
            $value = $this->crypt->decrypt($value);
        }

        return self::mapValueType($enum->name, $value);
    }

    /**
     * @param string $module
     * @param array $names
     * @param bool $withSecrets
     * @return array<string, string>
     */
    public function fetchValuesByNames(string $module, array $names, bool $withSecrets = false): array
    {
        $entities = $this->findByNames($module, $names);
        $data = [];
        foreach ($entities as $entity) {
            $value = $entity->getValue();
            if ($this->isSecretEntity($entity)) {
                if ($withSecrets) {
                    $value = $this->crypt->decrypt($value);
                } else {
                    continue;
                }
            }
            $name = $entity->getName();
            $data[$name] = self::mapValueType($name, $value);
        }
        return $data;
    }

    private function isSecretEntity(Configuration $entity): bool
    {
        $module = $entity->getModule();
        $name = $entity->getName();

        foreach (self::SECRETS_ENUM as $enum) {
            if ($enum->getModule() === $module && $enum->name === $name) {
                return true;
            }
        }

        return false;
    }

    private function findOneByEnum(ConfigEnum $enum): ?Configuration
    {
        return $this->findOneBy(['module' => $enum->getModule(), 'name' => $enum->name]);
    }

    /**
     * @param string $module
     * @param array $names
     * @return Configuration[]
     */
    private function findByNames(string $module, array $names): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.module = :module')
            ->andWhere('c.name IN (:names)')
            ->setParameters(
                new ArrayCollection([
                    new Parameter('module', $module),
                    new Parameter('names', $names)
                ])
            )
            ->getQuery()
            ->getResult();
    }

    private static function typeConversion(): array
    {
        return [
            AdServerConfig::ColdWalletIsActive->name => ConfigType::Bool,
            AdServerConfig::HotWalletMaxValue->name => ConfigType::Integer,
            AdServerConfig::HotWalletMinValue->name => ConfigType::Integer,
            AdServerConfig::WalletNodePort->name => ConfigType::Integer,

//            self::ALLOW_ZONE_IN_IFRAME => ConfigType::Bool,
//            self::AUTO_CONFIRMATION_ENABLED => ConfigType::Bool,
//            self::AUTO_REGISTRATION_ENABLED => ConfigType::Bool,
//            self::AUTO_WITHDRAWAL_LIMIT_ADS => ConfigType::Integer,
//            self::AUTO_WITHDRAWAL_LIMIT_BSC => ConfigType::Integer,
//            self::AUTO_WITHDRAWAL_LIMIT_BTC => ConfigType::Integer,
//            self::AUTO_WITHDRAWAL_LIMIT_ETH => ConfigType::Integer,
//            self::BANNER_FORCE_HTTPS => ConfigType::Bool,
//            self::BTC_WITHDRAW => ConfigType::Bool,
//            self::BTC_WITHDRAW_FEE => ConfigType::Float,
//            self::BTC_WITHDRAW_MAX_AMOUNT => ConfigType::Integer,
//            self::BTC_WITHDRAW_MIN_AMOUNT => ConfigType::Integer,
//            self::CAMPAIGN_MIN_BUDGET => ConfigType::Integer,
//            self::CAMPAIGN_MIN_CPA => ConfigType::Integer,
//            self::CAMPAIGN_MIN_CPM => ConfigType::Integer,
//            self::CHECK_ZONE_DOMAIN => ConfigType::Bool,
//            self::EMAIL_VERIFICATION_REQUIRED => ConfigType::Bool,
//            self::EXCHANGE_CURRENCIES => ConfigType::Array,
//            self::FIAT_DEPOSIT_MAX_AMOUNT => ConfigType::Integer,
//            self::FIAT_DEPOSIT_MIN_AMOUNT => ConfigType::Integer,
//            self::INVENTORY_EXPORT_WHITELIST => ConfigType::Array,
//            self::INVENTORY_IMPORT_WHITELIST => ConfigType::Array,
//            self::INVENTORY_WHITELIST => ConfigType::Array,
//            self::INVOICE_CURRENCIES => ConfigType::Array,
//            self::INVOICE_ENABLED => ConfigType::Bool,
//            self::MAX_PAGE_ZONES => ConfigType::Integer,
//            self::MAIL_SMTP_PORT => ConfigType::Integer,
//            self::NETWORK_DATA_CACHE_TTL => ConfigType::Integer,
//            self::NOW_PAYMENTS_EXCHANGE => ConfigType::Bool,
//            self::NOW_PAYMENTS_FEE => ConfigType::Float,
//            self::NOW_PAYMENTS_MAX_AMOUNT => ConfigType::Integer,
//            self::NOW_PAYMENTS_MIN_AMOUNT => ConfigType::Integer,
//            self::OPERATOR_TX_FEE => ConfigType::Float,
//            self::OPERATOR_RX_FEE => ConfigType::Float,
//            self::REFERRAL_REFUND_ENABLED => ConfigType::Bool,
//            self::REGISTRATION_USER_TYPES => ConfigType::Array,
//            self::SITE_ACCEPT_BANNERS_MANUALLY => ConfigType::Bool,
//            self::UPLOAD_LIMIT_IMAGE => ConfigType::Integer,
//            self::UPLOAD_LIMIT_MODEL => ConfigType::Integer,
//            self::UPLOAD_LIMIT_VIDEO => ConfigType::Integer,
//            self::UPLOAD_LIMIT_ZIP => ConfigType::Integer,
        ];
    }

    private static function mapValueType(string $key, ?string $value): string|array|int|null|float|bool
    {
        if (null === $value) {
            return null;
        }

        return match (self::typeConversion()[$key] ?? ConfigType::String) {
            ConfigType::Array => array_filter(explode(',', $value)),
            ConfigType::Bool => '1' === $value,
            ConfigType::Float => (float)$value,
            ConfigType::Integer => (int)$value,
            default => $value,
        };
    }
}
