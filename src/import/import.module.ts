import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { RolModule } from 'src/rol/rol.module';
import { DocumentoIdentidadModule } from 'src/documento_identidad/documento_identidad.module';
import { RolUsuarioModule } from 'src/rol_usuario/rol_usuario.module';
import { CursoModule } from 'src/curso/curso.module';
import { EapModule } from 'src/eap/eap.module';
import { PlanModule } from 'src/plan/plan.module';
import { CursoModalidadModule } from 'src/curso_modalidad/curso_modalidad.module';
import { ModalidadModule } from 'src/modalidad/modalidad.module';
import { ClaseModule } from 'src/clase/clase.module';
import { PeriodoModule } from 'src/periodo/periodo.module';


@Module({
  imports: [
    ClaseModule,
    CursoModalidadModule,
    CursoModule,
    DocumentoIdentidadModule,
    EapModule,
    ModalidadModule,
    PeriodoModule,
    PlanModule,
    RolModule,
    RolUsuarioModule,
    UsuarioModule,
  ],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
