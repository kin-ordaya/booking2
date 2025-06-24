import { Injectable } from '@nestjs/common';
import { CreateDetalleReservaDto } from './dto/create-detalle_reserva.dto';
import { UpdateDetalleReservaDto } from './dto/update-detalle_reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleReserva } from './entities/detalle_reserva.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetalleReservaService {
  constructor(
    @InjectRepository(DetalleReserva)
    private readonly detalleReservaRepository: Repository<DetalleReserva>,
  ) {}

  async create(createDetalleReservaDto: CreateDetalleReservaDto) {
    try {
      
    } catch (error) {
      
    }
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
