import { Module } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Clase } from 'src/clase/entities/clase.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Credencial } from 'src/credencial/entities/credencial.entity';
import { DetalleReserva } from 'src/detalle_reserva/entities/detalle_reserva.entity';
import { Responsable } from 'src/responsable/entities/responsable.entity';
import { RecursoCurso } from 'src/recurso_curso/entities/recurso_curso.entity';
import { CursoModalidad } from 'src/curso_modalidad/entities/curso_modalidad.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Clase,
      CursoModalidad,
      Credencial,
      DetalleReserva,
      Recurso,
      RecursoCurso,
      Reserva,
      Responsable,
      RolUsuario,
    ]),
  ],
  controllers: [ReservaController],
  providers: [ReservaService],
})
export class ReservaModule {}
