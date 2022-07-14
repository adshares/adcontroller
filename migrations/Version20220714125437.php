<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220714125437 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create table configuration';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<SQL
CREATE TABLE configuration (
  id INT AUTO_INCREMENT NOT NULL,
  name VARCHAR(255),
  value VARCHAR(255),
  created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  UNIQUE INDEX UNIQUE_NAME (name),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`
SQL
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE configuration');
    }
}
