<?php

namespace App\Repository;

use App\Entity\Asset;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Asset>
 *
 * @method Asset|null find($id, $lockMode = null, $lockVersion = null)
 * @method Asset|null findOneBy(array $criteria, array $orderBy = null)
 * @method Asset[]    findAll()
 * @method Asset[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AssetRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Asset::class);
    }

    /**
     * @param Asset[] $entities
     * @param bool $flush
     * @return void
     */
    public function upsert(array $entities, bool $flush = true): void
    {
        foreach ($entities as $entity) {
            $dbEntity = $this->findOneBy(['module' => $entity->getModule(), 'name' => $entity->getName()]);
            if (null === $dbEntity) {
                $dbEntity = $entity;
            } else {
                $dbEntity->setContent($entity->getContent());
            }

            $this->getEntityManager()->persist($dbEntity);
        }

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @param Asset[] $entities
     * @param bool $flush
     * @return void
     */
    public function remove(array $entities, bool $flush = true): void
    {
        foreach ($entities as $entity) {
            $this->getEntityManager()->remove($entity);
        }

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
