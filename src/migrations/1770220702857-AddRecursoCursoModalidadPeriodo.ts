import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecursoCursoModalidadPeriodo1770220702857 implements MigrationInterface {
    name = 'AddRecursoCursoModalidadPeriodo1770220702857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recurso_curso_periodo" DROP CONSTRAINT "FK_6b87b9df1b785fa571073b6fcc9"`);
        await queryRunner.query(`ALTER TABLE "recurso_curso_periodo" DROP CONSTRAINT "FK_921fcf77bedd86571f8e7b0ad83"`);
        await queryRunner.query(`ALTER TABLE "recurso_curso" DROP CONSTRAINT "FK_48dca50f1dfdb249e711fa11b3c"`);
        await queryRunner.query(`ALTER TABLE "recurso_curso" DROP CONSTRAINT "FK_e5d3b7c6cf5e72695ba18c39aee"`);
        await queryRunner.query(`ALTER TABLE "recurso_curso_periodo" DROP COLUMN "recurso_curso_id"`);
        await queryRunner.query(`ALTER TABLE "recurso_curso_periodo" DROP COLUMN "periodo_id"`);
        await queryRunner.query(`ALTER TABLE "recurso_curso" DROP COLUMN "curso_id"`);
        await queryRunner.query(`ALTER TABLE "recurso_curso" DROP COLUMN "recurso_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recurso_curso" ADD "recurso_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recurso_curso" ADD "curso_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recurso_curso_periodo" ADD "periodo_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recurso_curso_periodo" ADD "recurso_curso_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recurso_curso" ADD CONSTRAINT "FK_e5d3b7c6cf5e72695ba18c39aee" FOREIGN KEY ("curso_id") REFERENCES "curso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recurso_curso" ADD CONSTRAINT "FK_48dca50f1dfdb249e711fa11b3c" FOREIGN KEY ("recurso_id") REFERENCES "recurso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recurso_curso_periodo" ADD CONSTRAINT "FK_921fcf77bedd86571f8e7b0ad83" FOREIGN KEY ("periodo_id") REFERENCES "periodo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recurso_curso_periodo" ADD CONSTRAINT "FK_6b87b9df1b785fa571073b6fcc9" FOREIGN KEY ("recurso_curso_id") REFERENCES "recurso_curso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
