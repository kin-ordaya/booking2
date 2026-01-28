import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteDocumentoIdentidad1769618692611 implements MigrationInterface {
    name = 'DeleteDocumentoIdentidad1769618692611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "estudiante" DROP CONSTRAINT "FK_acf6681aa8782f78934a733464b"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP CONSTRAINT "FK_859dac6f2e2c06c6faa12fbd3c9"`);
        await queryRunner.query(`ALTER TABLE "estudiante" DROP COLUMN "documento_identidad_id"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN "documento_identidad_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario" ADD "documento_identidad_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "estudiante" ADD "documento_identidad_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuario" ADD CONSTRAINT "FK_859dac6f2e2c06c6faa12fbd3c9" FOREIGN KEY ("documento_identidad_id") REFERENCES "documento_identidad"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "estudiante" ADD CONSTRAINT "FK_acf6681aa8782f78934a733464b" FOREIGN KEY ("documento_identidad_id") REFERENCES "documento_identidad"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
