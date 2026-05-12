import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1778573662744 implements MigrationInterface {
    name = 'AutoMigration1778573662744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
