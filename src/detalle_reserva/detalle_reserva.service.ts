import { PaginationReservaDto } from './../reserva/dto/pagination-reserva.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDetalleReservaDto } from './dto/create-detalle_reserva.dto';
import { UpdateDetalleReservaDto } from './dto/update-detalle_reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleReserva } from './entities/detalle_reserva.entity';
import { Repository } from 'typeorm';
import { Reserva } from 'src/reserva/entities/reserva.entity';
import { PaginationDetalleReservaDto } from './dto/pagination_reserva.dto';

@Injectable()
export class DetalleReservaService {
  constructor(
    @InjectRepository(DetalleReserva)
    private readonly detalleReservaRepository: Repository<DetalleReserva>,

    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<DetalleReserva>,
  ) {}

  async create(createDetalleReservaDto: CreateDetalleReservaDto) {}

  async findAll(paginationDetalleReservaDto: PaginationDetalleReservaDto) {
    try {
      const { reserva_id, page, limit } = paginationDetalleReservaDto;

      const reserva = await this.reservaRepository.existsBy({ id: reserva_id });
      if (!reserva) {
        throw new NotFoundException('Reserva no encontrada');
      }

      // Obtener el conteo total
      const total = await this.detalleReservaRepository.count({
        where: { reserva: { id: reserva_id } },
      });

      // Obtener los detalles con paginación
      const detallesReserva = await this.detalleReservaRepository.find({
        where: { reserva: { id: reserva_id } },
        relations: ['credencial', 'credencial.rol'],
        take: limit,
        skip: (page - 1) * limit,
      });

      // Extraer solo las credenciales con su rol
      const results = detallesReserva.map((detalle) => ({
        ...detalle.credencial,
        rol: detalle.credencial.rol,
      }));

      return {
        results,
        meta: {
          count: results.length, // Cantidad en esta página
          total, // Total general de registros
          page,
          limit,
          totalPages: Math.ceil(total / limit), // Usar el total general
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener los detalles de reserva',
      );
    }
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
