import { Module } from '@nestjs/common';
import { DetalleReservaService } from './detalle_reserva.service';
import { DetalleReservaController } from './detalle_reserva.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleReserva } from './entities/detalle_reserva.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleReserva])],
  controllers: [DetalleReservaController],
  providers: [DetalleReservaService],
})
export class DetalleReservaModule {}
