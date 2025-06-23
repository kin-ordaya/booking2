import { Module } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Clase } from 'src/clase/entities/clase.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Clase, Recurso, RolUsuario])],
  controllers: [ReservaController],
  providers: [ReservaService],
})
export class ReservaModule {}
