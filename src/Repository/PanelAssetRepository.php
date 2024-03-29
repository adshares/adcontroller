<?php

namespace App\Repository;

use App\Entity\PanelAsset;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PanelAsset>
 *
 * @method PanelAsset|null find($id, $lockMode = null, $lockVersion = null)
 * @method PanelAsset|null findOneBy(array $criteria, array $orderBy = null)
 * @method PanelAsset[]    findAll()
 * @method PanelAsset[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PanelAssetRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PanelAsset::class);
    }

    /**
     * @param PanelAsset[] $entities
     * @param bool $flush
     * @return void
     */
    public function upsert(array $entities, bool $flush = true): void
    {
        foreach ($entities as $entity) {
            $dbEntity = $this->findOneBy(['fileId' => $entity->getFileId()]);
            if (null === $dbEntity) {
                $dbEntity = $entity;
            } else {
                $dbEntity->setFilePath($entity->getFilePath());
                $dbEntity->setHash($entity->getHash());
                $dbEntity->setMimeType($entity->getMimeType());
            }

            $this->getEntityManager()->persist($dbEntity);
        }

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @param PanelAsset[] $entities
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

    /**
     * @param array|string[] $fileIds
     * @return PanelAsset[]
     */
    public function findByFileIds(array $fileIds): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.fileId IN (:fileIds)')
            ->setParameter('fileIds', $fileIds)
            ->getQuery()
            ->getResult();
    }
}
