<?php

namespace App\Repository;

use App\Entity\Configuration;
use App\Entity\Enum\AdClassifyConfig;
use App\Entity\Enum\AdServerConfig;
use App\Entity\Enum\ConfigEnum;
use App\Service\Crypt;
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

        return $value;
    }

    /**
     * @param string $module
     * @param array $names
     * @return array<string, string>
     */
    public function fetchValuesByNames(string $module, array $names): array
    {
        $entities = $this->findByNames($module, $names);
        $data = [];
        foreach ($entities as $entity) {
            $value = $entity->getValue();
            if ($this->isSecretEntity($entity)) {
                $value = $this->crypt->decrypt($value);
            }
            $data[$entity->getName()] = $value;
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
}
