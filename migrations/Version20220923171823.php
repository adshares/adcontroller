<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220923171823 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Creates table `panel_asset` and drops `asset';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            <<<SQL
CREATE TABLE panel_asset (
  id INT AUTO_INCREMENT NOT NULL,
  file_id VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  mime_type VARCHAR(127) NOT NULL,
  hash CHAR(16) NOT NULL,
  created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  UNIQUE INDEX UNIQUE_FILE_ID (file_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`;
SQL
        );
        $this->addSql('DROP TABLE asset');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE panel_asset');
        $this->addSql(<<<SQL
CREATE TABLE asset (
  id INT AUTO_INCREMENT NOT NULL,
  module VARCHAR(31) NOT NULL,
  name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(127) NOT NULL,
  content LONGBLOB NOT NULL,
  created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  UNIQUE INDEX UNIQUE_NAME (module, name),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`;
SQL
        );
    }
}
