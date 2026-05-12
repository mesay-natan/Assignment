import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1778571518395 implements MigrationInterface {
    name = 'AutoMigration1778571518395'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "description" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "description" SET NOT NULL`);
    }

}
