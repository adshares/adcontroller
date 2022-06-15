<?php

namespace App\Repository;

use App\Entity\Configuration;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Configuration::class);
    }

    public function insertOrUpdateOne(string $name, string $value, bool $flush = true): void
    {
        $now = new DateTimeImmutable();

        if (null === ($entity = $this->findOneByName($name))) {
            $entity = new Configuration();
            $entity->setName($name);
            $entity->setCreatedAt($now);
        }
        $entity->setValue($value);
        $entity->setUpdatedAt($now);

        $this->getEntityManager()->persist($entity);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function insertOrUpdate(array $data, bool $flush = true): void
    {
        $now = new DateTimeImmutable();

        $entities = $this->findByNames(array_keys($data));
        $names = array_map(fn($entity) => $entity->getName(), $entities);
        $entities = array_combine($names, $entities);

        foreach ($data as $name => $value) {
            if (!isset($entities[$name])) {
                $entity = new Configuration();
                $entity->setName($name);
                $entity->setCreatedAt($now);
            } else {
                $entity = $entities[$name];
            }
            $entity->setValue($value);
            $entity->setUpdatedAt($now);

            $this->getEntityManager()->persist($entity);
        }

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(string $key, bool $flush = true): void
    {
        if (null === ($entity = $this->findOneByName($key))) {
            return;
        }

        $this->getEntityManager()->remove($entity);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function fetchValueByName(string $name): ?string
    {
        if (null === ($configuration = $this->findOneBy(['name' => $name]))) {
            return null;
        }
        return $configuration->getValue();
    }

    /**
     * @param array $names
     * @return array<string, string>
     */
    public function fetchValuesByNames(array $names): array
    {
        $entities = $this->findByNames($names);
        $data = [];
        foreach ($entities as $entity) {
            $data[$entity->getName()] = $entity->getValue();
        }
        return $data;
    }

    private function findOneByName(string $key): ?Configuration
    {
        return $this->findOneBy(['name' => $key]);
    }

    /**
     * @param array $names
     * @return Configuration[]
     */
    private function findByNames(array $names): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.name IN (:names)')
            ->setParameter('names', $names)
            ->getQuery()
            ->getResult();
    }
}
