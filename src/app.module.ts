import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CursoModule } from './curso/curso.module';
import { FacultadModule } from './facultad/facultad.module';
import { EapModule } from './eap/eap.module';
import { PlanModule } from './plan/plan.module';
import { ContactoModule } from './contacto/contacto.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { TipoRecursoModule } from './tipo_recurso/tipo_recurso.module';
import { RecursoModule } from './recurso/recurso.module';
import { ModalidadModule } from './modalidad/modalidad.module';
import { CursoModalidadModule } from './curso_modalidad/curso_modalidad.module';
import { RecursoCursoModule } from './recurso_curso/recurso_curso.module';
import { UsuarioModule } from './usuario/usuario.module';
import { RolModule } from './rol/rol.module';
import { DocumentoIdentidadModule } from './documento_identidad/documento_identidad.module';
import { CampusModule } from './campus/campus.module';
import { RolUsuarioModule } from './rol_usuario/rol_usuario.module';
import { ResponsableModule } from './responsable/responsable.module';
import { ClaseModule } from './clase/clase.module';
import { AulaModule } from './aula/aula.module';
import { EstudianteModule } from './estudiante/estudiante.module';
import { MatriculaClaseModule } from './matricula_clase/matricula_clase.module';
import { ReservaModule } from './reserva/reserva.module';
import { DetalleReservaModule } from './detalle_reserva/detalle_reserva.module';
import { CredencialModule } from './credencial/credencial.module';
import { TipoAccesoModule } from './tipo_acceso/tipo_acceso.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      logging: true
    }),
    AulaModule,
    CampusModule,
    ClaseModule,
    ContactoModule,
    CredencialModule,
    CursoModalidadModule,
    CursoModule,
    DetalleReservaModule,
    DocumentoIdentidadModule,
    EapModule,
    EstudianteModule,
    FacultadModule,
    MatriculaClaseModule,
    ModalidadModule,
    PlanModule,
    ProveedorModule,
    RecursoCursoModule,
    RecursoModule,
    ReservaModule,
    ResponsableModule,
    RolModule,
    RolUsuarioModule,
    TipoAccesoModule,
    TipoRecursoModule,
    UsuarioModule,
  ],
})
export class AppModule {}
