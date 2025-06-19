<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250614193703 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE task (id SERIAL NOT NULL, related_column_id INT NOT NULL, title VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, priority VARCHAR(255) NOT NULL, due_date DATE DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_527EDB25164FD2CE ON task (related_column_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN task.due_date IS '(DC2Type:date_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE task_user (task_id INT NOT NULL, user_id INT NOT NULL, PRIMARY KEY(task_id, user_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_FE2042328DB60186 ON task_user (task_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_FE204232A76ED395 ON task_user (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE task_task_label (task_id INT NOT NULL, task_label_id INT NOT NULL, PRIMARY KEY(task_id, task_label_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_D51000678DB60186 ON task_task_label (task_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_D51000677379C575 ON task_task_label (task_label_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE task_column (id SERIAL NOT NULL, title VARCHAR(255) NOT NULL, color VARCHAR(7) NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE task_label (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task ADD CONSTRAINT FK_527EDB25164FD2CE FOREIGN KEY (related_column_id) REFERENCES task_column (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_user ADD CONSTRAINT FK_FE2042328DB60186 FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_user ADD CONSTRAINT FK_FE204232A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_task_label ADD CONSTRAINT FK_D51000678DB60186 FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_task_label ADD CONSTRAINT FK_D51000677379C575 FOREIGN KEY (task_label_id) REFERENCES task_label (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task DROP CONSTRAINT FK_527EDB25164FD2CE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_user DROP CONSTRAINT FK_FE2042328DB60186
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_user DROP CONSTRAINT FK_FE204232A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_task_label DROP CONSTRAINT FK_D51000678DB60186
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_task_label DROP CONSTRAINT FK_D51000677379C575
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE task
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE task_user
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE task_task_label
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE task_column
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE task_label
        SQL);
    }
}
