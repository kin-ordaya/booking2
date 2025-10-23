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
      const { reserva_id, page, limit, search } = paginationDetalleReservaDto;

      const reserva = await this.reservaRepository.existsBy({ id: reserva_id });
      if (!reserva) {
        throw new NotFoundException('Reserva no encontrada');
      }

      // Crear query builder para manejar la búsqueda
      const queryBuilder = this.detalleReservaRepository
        .createQueryBuilder('detalleReserva')
        .leftJoinAndSelect('detalleReserva.credencial', 'credencial')
        .leftJoinAndSelect('credencial.rol', 'rol')
        .where('detalleReserva.reserva.id = :reserva_id', { reserva_id });

      // Aplicar búsqueda si existe
      if (search) {
        queryBuilder.andWhere('credencial.usuario ILIKE :search', {
          search: `%${search}%`,
        });
      }

      // Obtener el conteo total CON la búsqueda aplicada
      const total = await queryBuilder.getCount();

      // Obtener los detalles con paginación y búsqueda
      const detallesReserva = await queryBuilder
        .take(limit)
        .skip((page - 1) * limit)
        .getMany();

      // Extraer solo las credenciales con su rol
      const results = detallesReserva.map((detalle) => ({
        ...detalle.credencial,
        rol: detalle.credencial.rol,
      }));

      return {
        results,
        meta: {
          count: results.length, // Cantidad en esta página
          total, // Total general de registros (con filtro aplicado)
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error en findAll detalles reserva:', error);
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
