import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveryStatusAndFiles1760000000000 implements MigrationInterface {
  name = 'AddDeliveryStatusAndFiles1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE delivery_status_enum AS ENUM ('submitted', 'approved', 'revision_requested');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(
      `ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS status delivery_status_enum NOT NULL DEFAULT 'submitted'`,
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS delivery_files (
        id uuid PRIMARY KEY,
        dispatch_id uuid NOT NULL,
        owner_id uuid NOT NULL,
        original_name varchar(255) NOT NULL,
        content_type varchar(255) NOT NULL,
        size_bytes integer NOT NULL,
        storage_path varchar(1000) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS delivery_files`);
    await queryRunner.query(`ALTER TABLE deliveries DROP COLUMN IF EXISTS status`);
    await queryRunner.query(`DROP TYPE IF EXISTS delivery_status_enum`);
  }
}
