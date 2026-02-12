import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexReserva1770909238222 implements MigrationInterface {
    name = 'AddIndexReserva1770909238222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_reserva_creacion" ON "reserva" ("creacion") `);
        await queryRunner.query(`CREATE INDEX "idx_reserva_estado" ON "reserva" ("estado") `);
        await queryRunner.query(`CREATE INDEX "idx_reserva_codigo" ON "reserva" ("codigo") `);
        await queryRunner.query(`CREATE INDEX "idx_reserva_fin" ON "reserva" ("fin") `);
        await queryRunner.query(`CREATE INDEX "idx_reserva_recurso_id" ON "reserva" ("recurso_id") `);
        await queryRunner.query(`CREATE INDEX "idx_reserva_docente_id" ON "reserva" ("docente_id") `);
        await queryRunner.query(`CREATE INDEX "idx_reserva_creacion_estado" ON "reserva" ("creacion", "estado") `);
        await queryRunner.query(`CREATE INDEX "idx_reserva_fin_estado" ON "reserva" ("fin", "estado") `);
        await queryRunner.query(`CREATE INDEX "idx_reserva_recurso_estado" ON "reserva" ("recurso_id", "estado") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_reserva_recurso_estado"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reserva_fin_estado"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reserva_creacion_estado"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reserva_docente_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reserva_recurso_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reserva_fin"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reserva_codigo"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reserva_estado"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reserva_creacion"`);
    }

}
