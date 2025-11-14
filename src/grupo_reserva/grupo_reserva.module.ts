import { Module } from '@nestjs/common';
import { GrupoReservaService } from './grupo_reserva.service';
import { GrupoReservaController } from './grupo_reserva.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoReserva } from './entities/grupo_reserva.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GrupoReserva])],
  controllers: [GrupoReservaController],
  providers: [GrupoReservaService],
})
export class GrupoReservaModule {}
