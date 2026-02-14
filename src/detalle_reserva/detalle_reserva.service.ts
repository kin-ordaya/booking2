import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleReserva } from './entities/detalle_reserva.entity';
import { Brackets, Repository } from 'typeorm';
import { PaginationDetalleReservaDto } from './dto/pagination_reserva.dto';

@Injectable()
export class DetalleReservaService {
  constructor(
    @InjectRepository(DetalleReserva)
    private readonly detalleReservaRepository: Repository<DetalleReserva>,
  ) {}

  async findAll(paginationDetalleReservaDto: PaginationDetalleReservaDto) {
    try {
      const { reserva_id, page, limit, search } = paginationDetalleReservaDto;

      const queryBuilder = this.detalleReservaRepository
        .createQueryBuilder('detalleReserva')
        .leftJoin('detalleReserva.credencial', 'credencial')
        .leftJoin('credencial.rol', 'rol')
        .select([
          'credencial.usuario',
          'credencial.clave',
          'rol.nombre',
        ])
        .addSelect('COUNT(*) OVER()', 'total_count')
        .where('detalleReserva.reserva.id = :reserva_id', { reserva_id });

      if (search !== undefined && search.trim() !== '') {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('credencial.usuario ILIKE :search').orWhere(
              'rol.nombre ILIKE :search',
            );
          }),
          { search: `%${search}%` },
        );
      }

      const results = await queryBuilder
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      const total_count = results.length > 0 ? parseInt(results[0].total_count, 10) : 0;

      const formattedResults = results.map((row) => ({
        usuario: row.credencial_usuario,
        clave: row.credencial_clave,
        rol: {
          nombre: row.rol_nombre,
        },
      }));

      return {
        results: formattedResults,
        meta: {
          count: total_count,
          page,
          limit,
          totalPages: Math.ceil(total_count / limit),
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
}
