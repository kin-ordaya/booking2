import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecursoCursoModalidadDto } from './dto/create-recurso_curso_modalidad.dto';
import { UpdateRecursoCursoModalidadDto } from './dto/update-recurso_curso_modalidad.dto';
import { Not, Repository } from 'typeorm';
import { RecursoCursoModalidad } from './entities/recurso_curso_modalidad.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CursoModalidad } from '@/curso_modalidad/entities/curso_modalidad.entity';
import { Recurso } from '@/recurso/entities/recurso.entity';
import { PaginationRecursoCursoModalidadDto } from './dto/pagination-recurso_curso_modalidad.dto';

@Injectable()
export class RecursoCursoModalidadService {
  constructor(
    @InjectRepository(RecursoCursoModalidad)
    private readonly recursoCursoModalidadRepository: Repository<RecursoCursoModalidad>,
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
    @InjectRepository(CursoModalidad)
    private readonly cursoModalidadRepository: Repository<CursoModalidad>,
  ) {}

  async create(
    createRecursoCursoModalidadDto: CreateRecursoCursoModalidadDto,
  ): Promise<RecursoCursoModalidad> {
    try {
      const { recurso_id, curso_modalidad_id } = createRecursoCursoModalidadDto;
      const [recursoCursoModalidadExists, recursoExists, cursoModalidadExists] =
        await Promise.all([
          this.recursoCursoModalidadRepository.existsBy({
            cursoModalidad: { id: curso_modalidad_id },
            recurso: { id: recurso_id },
          }),
          this.recursoRepository.existsBy({ id: recurso_id }),
          this.cursoModalidadRepository.existsBy({ id: curso_modalidad_id }),
        ]);

      if (recursoCursoModalidadExists)
        throw new ConflictException(
          'Ya existe un recurso curso modalidad con ese id',
        );

      if (!recursoExists)
        throw new NotFoundException('No existe un recurso con ese id');

      if (!cursoModalidadExists)
        throw new NotFoundException('No existe un curso modalidad con ese id');

      const recursoCursoModalidad = this.recursoCursoModalidadRepository.create(
        {
          recurso: { id: recurso_id },
          cursoModalidad: { id: curso_modalidad_id },
        },
      );
      return await this.recursoCursoModalidadRepository.save(
        recursoCursoModalidad,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al crear recurso curso modalidad',
      );
    }
  }

  async findAll(
    paginationRecursoCursoModalidadDto: PaginationRecursoCursoModalidadDto,
  ) {
    try {
      const { page, limit, sort_name, sort_state, curso_modalidad_id, search } =
        paginationRecursoCursoModalidadDto;

      const query = this.recursoCursoModalidadRepository
        .createQueryBuilder('rcm')
        .leftJoin('rcm.recurso', 'recurso')
        .leftJoin('rcm.cursoModalidad', 'cursoModalidad')
        .leftJoin('cursoModalidad.curso', 'curso')
        .leftJoin('cursoModalidad.modalidad', 'modalidad')
        .select([
          'rcm.id',
          'recurso.id',
          'recurso.nombre',
          'recurso.creacion',
          'cursoModalidad.id',
          'curso.id',
          'curso.nombre',
          'curso.codigo',
          'modalidad.id',
          'modalidad.nombre',
        ])
        .addSelect('COUNT(*) OVER() AS total_count');

      if (sort_name !== undefined) {
        query.orderBy('recurso.nombre', sort_name === 1 ? 'ASC' : 'DESC');
      } else {
        query.orderBy('recurso.creacion', 'DESC');
      }

      if (sort_state !== undefined) {
        query.andWhere('rcm.estado = :estado', {
          estado: sort_state === 1 ? 1 : 0,
        });
      }

      if (curso_modalidad_id !== undefined) {
        query.andWhere('cursoModalidad.id = :curso_modalidad_id', {
          curso_modalidad_id,
        });
      }

      if (search !== undefined && search.trim() !== '') {
        query.andWhere(
          'recurso.nombre LIKE :search  OR curso.nombre LIKE :search',
          {
            search: `%${search.toUpperCase()}%`,
          },
        );
      }

      const results = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      const count =
        results.length > 0 ? parseInt(results[0].total_count, 10) : 0;

      const formattedResults = results.map((raw) => ({
        id: raw.rcm_id,
        cursoModalidad: {
          id: raw.cursoModalidad_id,
          curso: {
            id: raw.curso_id,
            codigo: raw.curso_codigo,
            nombre: raw.curso_nombre,
          },
          modalidad: {
            id: raw.modalidad_id,
            nombre: raw.modalidad_nombre,
          },
        },
        recurso: {
          id: raw.recurso_id,
          creacion: raw.recurso_creacion,
          nombre: raw.recurso_nombre,
        },
      }));

      return {
        results: formattedResults,
        meta: {
          count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al recuperar recursos cursos modalidad',
      );
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del recurso curso modalidad no puede estar vacío',
        );

      const recursoCursoModalidad =
        await this.recursoCursoModalidadRepository.findOneBy({ id });
      if (!recursoCursoModalidad)
        throw new NotFoundException(
          'No existe un recurso curso modalidad con ese id',
        );
      return recursoCursoModalidad;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al recuperar recurso');
    }
  }

  async update(
    id: string,
    updateRecursoCursoModalidadDto: UpdateRecursoCursoModalidadDto,
  ) {
    try {
      const { recurso_id, curso_modalidad_id } = updateRecursoCursoModalidadDto;

      if (!id) {
        throw new BadRequestException(
          'El ID del recurso curso modalidad no puede estar vacío',
        );
      }

      const [
        idRecursoCursoModalidadExists,
        recursoExists,
        cursoModalidadExists,
        recursoCursoModalidadExists,
      ] = await Promise.all([
        this.recursoCursoModalidadRepository.existsBy({ id }),
        this.recursoRepository.existsBy({ id: recurso_id }),
        this.cursoModalidadRepository.existsBy({ id: curso_modalidad_id }),
        this.recursoCursoModalidadRepository.existsBy({
          id: Not(id),
          recurso: { id: recurso_id },
          cursoModalidad: { id: curso_modalidad_id },
        }),
      ]);

      if (!idRecursoCursoModalidadExists)
        throw new NotFoundException(
          'No existe un recurso curso modalidad con ese id',
        );

      if (!recursoExists)
        throw new NotFoundException('No existe un recurso con ese id');

      if (!cursoModalidadExists)
        throw new NotFoundException('No existe un curso modalidad con ese id');

      if (recursoCursoModalidadExists)
        throw new ConflictException(
          'Ya existe una asignación de este recurso a este curso modalidad',
        );

      const updateData: Partial<RecursoCursoModalidad> & {
        recurso?: any;
        cursoModalidad?: any;
      } = {};

      if (recurso_id !== undefined) {
        updateData.recurso = { id: recurso_id };
      }

      if (curso_modalidad_id !== undefined) {
        updateData.cursoModalidad = { id: curso_modalidad_id };
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException(
          'No hay datos para actualizar el recurso curso modalidad',
        );
      }

      await this.recursoCursoModalidadRepository.update(id, updateData);

      return await this.recursoCursoModalidadRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar recurso curso modalidad',
      );
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del recurso curso modalidad no puede estar vacío',
        );

      const result = await this.recursoCursoModalidadRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Recurso curso modalidad no encontrado');

      return this.recursoCursoModalidadRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        'Error al deshabilitar/habilitar recurso curso modalidad',
      );
    }
  }
}
