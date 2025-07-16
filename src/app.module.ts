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
import { PabellonModule } from './pabellon/pabellon.module';
import { LaboratorioModule } from './laboratorio/laboratorio.module';
import { LaboratorioAulaModule } from './laboratorio_aula/laboratorio_aula.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { HorarioModule } from './horario/horario.module';
import { ClaseAulaModule } from './clase_aula/clase_aula.module';
import { DeclaracionJuradaModule } from './declaracion_jurada/declaracion_jurada.module';
import { types } from 'pg';

// Configura los parsers de fecha ANTES de iniciar TypeORM
types.setTypeParser(1114, (val) => new Date(val + 'Z')); // timestamp sin timezone
types.setTypeParser(1184, (val) => new Date(val + 'Z')); // timestamptz

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'abc123',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '1h' },
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
      logging: true,
      // extra: {
      //   options: '-c timezone=UTC', // 👈 Fuerza UTC enla conexión
      //   // types: {
      //   //   getTypeParser: (oid) => (val) => {
      //   //     if (oid === 1114 || oid === 1184) {
      //   //       // timestamp/timestamptz
      //   //       return new Date(val + 'Z'); // Fuerza interpretación UTC
      //   //     }
      //   //     return val;
      //   //   },
      //   // },
      // },
    }),
    AulaModule,
    AuthModule,
    CampusModule,
    ClaseAulaModule,
    ClaseModule,
    ContactoModule,
    CredencialModule,
    CursoModalidadModule,
    CursoModule,
    DeclaracionJuradaModule,
    DetalleReservaModule,
    DocumentoIdentidadModule,
    EapModule,
    EstudianteModule,
    FacultadModule,
    HorarioModule,
    LaboratorioAulaModule,
    LaboratorioModule,
    MatriculaClaseModule,
    ModalidadModule,
    PabellonModule,
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
