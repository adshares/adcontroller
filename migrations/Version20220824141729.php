<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220824141729 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Creates tables `asset` and `ext_log_entries`';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<SQL
ALTER TABLE configuration
  CHANGE name name VARCHAR(255) NOT NULL,
  CHANGE module module VARCHAR(31) NOT NULL,
  CHANGE value value LONGTEXT DEFAULT NULL;
SQL
        );

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_520_ci`;
SQL
        );

        $this->addSql(<<<SQL
CREATE TABLE ext_log_entries (
  id INT AUTO_INCREMENT NOT NULL,
  action VARCHAR(8) NOT NULL,
  logged_at DATETIME NOT NULL,
  object_id VARCHAR(64) DEFAULT NULL,
  object_class VARCHAR(191) NOT NULL,
  version INT NOT NULL,
  data LONGTEXT DEFAULT NULL COMMENT '(DC2Type:array)',
  username VARCHAR(191) DEFAULT NULL,
  INDEX log_class_lookup_idx (object_class),
  INDEX log_date_lookup_idx (logged_at),
  INDEX log_user_lookup_idx (username),
  INDEX log_version_lookup_idx (object_id, object_class, version),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_520_ci` ROW_FORMAT = DYNAMIC
SQL
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE ext_log_entries');
        $this->addSql('DROP TABLE asset');
        $this->addSql(<<<SQL
ALTER TABLE configuration
      CHANGE module module VARCHAR(31),
      CHANGE name name VARCHAR(255),
      CHANGE value value TEXT
SQL
        );
    }
}
