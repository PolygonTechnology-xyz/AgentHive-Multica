import { MigrationInterface, QueryRunner } from 'typeorm';

export class S2CliProfileFixes1717070400000 implements MigrationInterface {
  name = 'S2CliProfileFixes1717070400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS handle varchar(64)`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills json`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url varchar(512)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS IDX_users_handle_unique ON users (handle) WHERE handle IS NOT NULL`);
    await queryRunner.query(`DO $$ BEGIN CREATE TYPE workforce_agents_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'REMOVED'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS workforce_agents (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, name varchar(128) NOT NULL, skill_index json NOT NULL, status workforce_agents_status_enum NOT NULL DEFAULT 'ACTIVE', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_workforce_agents_user_id ON workforce_agents (user_id)`);
    await queryRunner.query(`ALTER TABLE bidder_agents ADD COLUMN IF NOT EXISTS skill_index json`);
    await queryRunner.query(`ALTER TYPE bidder_agents_status_enum ADD VALUE IF NOT EXISTS 'dormant'`);
    await queryRunner.query(`ALTER TABLE bidder_agents ALTER COLUMN status SET DEFAULT 'dormant'`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE bidder_agents ALTER COLUMN status SET DEFAULT 'active'`);
    await queryRunner.query(`ALTER TABLE bidder_agents DROP COLUMN IF EXISTS skill_index`);
    await queryRunner.query(`DROP TABLE IF EXISTS workforce_agents`);
    await queryRunner.query(`DROP TYPE IF EXISTS workforce_agents_status_enum`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_users_handle_unique`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS photo_url`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS skills`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS handle`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS bio`);
  }
}
