import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUKTaxFields1729762800000 implements MigrationInterface {
  name = 'AddUKTaxFields1729762800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add UK-specific tax fields to employees table
    await queryRunner.query(
      `ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "taxReference" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "niNumber" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "taxDistrict" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove UK-specific tax fields from employees table
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "taxDistrict"`);
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "niNumber"`);
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "taxReference"`);
  }
}
