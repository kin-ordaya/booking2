import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteNumeroDocumento1769628873178 implements MigrationInterface {
    name = 'DeleteNumeroDocumento1769628873178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "estudiante" DROP COLUMN "numero_documento"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN "numero_documento"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario" ADD "numero_documento" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "estudiante" ADD "numero_documento" character varying(100) NOT NULL`);
    }

}
