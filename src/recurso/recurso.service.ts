import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecursoDto } from './dto/create-recurso.dto';
import { UpdateRecursoDto } from './dto/update-recurso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Recurso } from './entities/recurso.entity';
import { Not, Repository } from 'typeorm';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { TipoRecurso } from 'src/tipo_recurso/entities/tipo_recurso.entity';

@Injectable()
export class RecursoService {
  constructor(
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,

    @InjectRepository(TipoRecurso)
    private readonly tipoRecursoRepository: Repository<TipoRecurso>,

    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  async create(createRecursoDto: CreateRecursoDto) {
    try {
      const {
        nombre,
        descripcion,
        cantidad_credenciales,
        link_declaracion,
        tiempo_reserva,
        tipo_recurso_id,
        proveedor_id,
      } = createRecursoDto;

      const [tipoRecursoExists, proveedorExists, nombreExists] =
        await Promise.all([
          this.tipoRecursoRepository.existsBy({ id: tipo_recurso_id }),
          this.proveedorRepository.existsBy({ id: proveedor_id }),
          this.recursoRepository.existsBy({ nombre }),
        ]);

      if (!tipoRecursoExists)
        throw new NotFoundException('No existe un tipoRecurso con ese id');
      if (!proveedorExists)
        throw new NotFoundException('No existe un proveedor con ese id');
      if (nombreExists)
        throw new ConflictException('Ya existe un recurso con ese nombre');

      const recurso = this.recursoRepository.create({
        nombre,
        descripcion,
        cantidad_credenciales,
        link_declaracion,
        tiempo_reserva,
        tipoRecurso: { id: tipo_recurso_id },
        proveedor: { id: proveedor_id },
      });
      return await this.recursoRepository.save(recurso);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page, limit, search } = paginationDto;
      const query = this.recursoRepository
        .createQueryBuilder('recurso')
        .leftJoinAndSelect('recurso.tipoRecurso', 'tipoRecurso')
        .leftJoinAndSelect('recurso.proveedor', 'proveedor')
        .select([
          'recurso.id',
          'recurso.nombre',
          'recurso.cantidad_credenciales',
          'recurso.link_declaracion',
          'recurso.estado',
          'tipoRecurso.nombre',
          'proveedor.nombre',
        ]);

      if (search) {
        query.where(
          'UPPER(recurso.nombre) LIKE UPPEr(:search) OR UPPER(recurso.descripcion) LIKE UPPER(:search)',
          { search: `%${search}%` },
        );
      }
      const [results, count] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      return {
        results,
        meta: {
          count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string): Promise<Recurso> {
    try {
      if (!id)
        throw new BadRequestException('El ID del recurso no puede estar vacío');

      const recurso = await this.recursoRepository.findOneBy({ id });
      if (!recurso) throw new NotFoundException('Recurso no encontrado');
      return recurso;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateRecursoDto: UpdateRecursoDto) {
    try {
      const {
        nombre,
        descripcion,
        cantidad_credenciales,
        link_declaracion,
        tiempo_reserva,
        tipo_recurso_id,
        proveedor_id,
      } = updateRecursoDto;

      if (!id)
        throw new BadRequestException('El ID del recurso no puede estar vacío');

      const recurso = await this.recursoRepository.findOneBy({ id });
      if (!recurso) {
        throw new NotFoundException('Recurso no encontrado');
      }

      const updateData: any = {};

      if (nombre !== undefined) {
        const nombreExists = await this.recursoRepository.existsBy({
          id: Not(id),
          nombre,
        });

        if (nombreExists) {
          throw new ConflictException('Ya existe un recurso con ese nombre');
        }
        updateData.nombre = nombre;
      }
      if (proveedor_id !== undefined) {
        const proveedorExists = await this.proveedorRepository.existsBy({
          id: proveedor_id,
        });

        if (!proveedorExists) {
          throw new NotFoundException('No existe un proveedor con ese id');
        }
        updateData.proveedor = { id: proveedor_id };
      }

      if (tipo_recurso_id !== undefined) {
        const tipoRecursoExists = await this.tipoRecursoRepository.existsBy({
          id: tipo_recurso_id,
        });

        if (!tipoRecursoExists) {
          throw new NotFoundException('No existe un tipoRecurso con ese id');
        }
        updateData.tipoRecurso = { id: tipo_recurso_id };
      }

      if (descripcion !== undefined) {
        updateData.descripcion = descripcion;
      }
      if (cantidad_credenciales !== undefined) {
        updateData.cantidad_credenciales = cantidad_credenciales;
      }
      if (link_declaracion !== undefined) {
        updateData.link_declaracion = link_declaracion;
      }
      if (tiempo_reserva !== undefined) {
        updateData.tiempo_reserva = tiempo_reserva;
      }

      if (Object.keys(updateData).length === 0) {
        return recurso;
      }

      await this.recursoRepository.update(id, updateData);

      return await this.recursoRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del recurso no puede estar vacío');

      const result = await this.recursoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Recurso no encontrado');
      return this.recursoRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
