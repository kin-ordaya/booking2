import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedGrupoReserva1771346404902 implements MigrationInterface {
    name = 'ModifiedGrupoReserva1771346404902'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grupo_reserva" DROP COLUMN "recurso_id"`);
        await queryRunner.query(`ALTER TABLE "grupo_reserva" DROP COLUMN "autor_id"`);
        await queryRunner.query(`ALTER TABLE "grupo_reserva" DROP COLUMN "clase_id"`);
        await queryRunner.query(`ALTER TABLE "grupo_reserva" DROP COLUMN "docente_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grupo_reserva" ADD "docente_id" character varying`);
        await queryRunner.query(`ALTER TABLE "grupo_reserva" ADD "clase_id" character varying`);
        await queryRunner.query(`ALTER TABLE "grupo_reserva" ADD "autor_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grupo_reserva" ADD "recurso_id" character varying NOT NULL`);
    }

}
