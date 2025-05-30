import { Injectable } from '@nestjs/common';
import { CreateDetalleReservaDto } from './dto/create-detalle_reserva.dto';
import { UpdateDetalleReservaDto } from './dto/update-detalle_reserva.dto';

@Injectable()
export class DetalleReservaService {
  create(createDetalleReservaDto: CreateDetalleReservaDto) {
    return 'This action adds a new detalleReserva';
  }

  findAll() {
    return `This action returns all detalleReserva`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detalleReserva`;
  }

  update(id: number, updateDetalleReservaDto: UpdateDetalleReservaDto) {
    return `This action updates a #${id} detalleReserva`;
  }

  remove(id: number) {
    return `This action removes a #${id} detalleReserva`;
  }
}
