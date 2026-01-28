import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { EmailModule } from './email/email.module';
import { SeccionEmailModule } from './seccion_email/seccion_email.module';
import { PeriodoModule } from './periodo/periodo.module';
// import { ImportModule } from './import/import.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from './config/pinoConfig';
import { LogModule } from './log/log.module';
import { GrupoReservaModule } from './grupo_reserva/grupo_reserva.module';
import { RecursoCursoPeriodoModule } from './recurso_curso_periodo/recurso_curso_periodo.module';
import { PowerbiModule } from './powerbi/powerbi.module';

// Configura los parsers de fecha ANTES de iniciar TypeORM
types.setTypeParser(1114, (val) => new Date(val + 'Z')); // timestamp sin timezone
types.setTypeParser(1184, (val) => new Date(val + 'Z')); // timestamptz

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache:true
    }),

    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        pinoConfig(configService),
    }),

    JwtModule.registerAsync({
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        // migrations:['src/migrations/*.ts'],
        logging: config.get('NODE_ENV') === 'development', // Solo en desarrollo
        extra: {
          options: '-c timezone=UTC', // 👈 Fuerza UTC enla conexión
          // types: {
          //   getTypeParser: (oid) => (val) => {
          //     if (oid === 1114 || oid === 1184) {
          //       // timestamp/timestamptz
          //       return new Date(val + 'Z'); // Fuerza interpretación UTC
          //     }
          //     return val;
          //   },
          // },
        },
      }),
      inject: [ConfigService],
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
    EapModule,
    EmailModule,
    EstudianteModule,
    FacultadModule,
    GrupoReservaModule,
    HealthModule,
    HorarioModule,
    // ImportModule,
    LaboratorioAulaModule,
    LaboratorioModule,
    LogModule,
    MatriculaClaseModule,
    ModalidadModule,
    PabellonModule,
    PeriodoModule,
    PlanModule,
    ProveedorModule,
    RecursoCursoModule,
    RecursoCursoPeriodoModule,
    RecursoModule,
    ReservaModule,
    ResponsableModule,
    RolModule,
    RolUsuarioModule,
    SeccionEmailModule,
    TipoAccesoModule,
    TipoRecursoModule,
    UsuarioModule,
    PowerbiModule,
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  // }
}
