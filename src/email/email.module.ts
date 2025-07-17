import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from 'src/reserva/entities/reserva.entity';
import { DetalleReserva } from 'src/detalle_reserva/entities/detalle_reserva.entity';
import { Credencial } from 'src/credencial/entities/credencial.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recurso, Reserva, DetalleReserva, Credencial,RolUsuario ])],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
