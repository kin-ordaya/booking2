import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecursoCursoModalidadPeriodoDto } from './dto/create-recurso_curso_modalidad_periodo.dto';
import { UpdateRecursoCursoModalidadPeriodoDto } from './dto/update-recurso_curso_modalidad_periodo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RecursoCursoModalidadPeriodo } from './entities/recurso_curso_modalidad_periodo.entity';
import { Not, Repository } from 'typeorm';
import { Periodo } from '@/periodo/entities/periodo.entity';
import { RecursoCursoModalidad } from '@/recurso_curso_modalidad/entities/recurso_curso_modalidad.entity';
import { GetRecursoCursoModalidadPeriodoDto } from './dto/get-recurso_curso_modalidad_periodo.dto';

@Injectable()
export class RecursoCursoModalidadPeriodoService {
  constructor(
    @InjectRepository(RecursoCursoModalidadPeriodo)
    private readonly recursoCursoModalidadPeriodoRepository: Repository<RecursoCursoModalidadPeriodo>,
    @InjectRepository(RecursoCursoModalidad)
    private readonly recursoCursoModalidadRepository: Repository<RecursoCursoModalidad>,
    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
  ) {}

  async create(
    createRecursoCursoModalidadPeriodoDto: CreateRecursoCursoModalidadPeriodoDto,
  ) {
    try {
      const { inicio, fin, recurso_curso_modalidad_id, periodo_id } =
        createRecursoCursoModalidadPeriodoDto;

      const [
        recursoCursoModalidadPeriodoExists,
        recursoCursoModalidadExists,
        periodoExists,
      ] = await Promise.all([
        this.recursoCursoModalidadPeriodoRepository.existsBy({
          recursoCursoModalidad: { id: recurso_curso_modalidad_id },
          periodo: { id: periodo_id },
        }),
        this.recursoCursoModalidadRepository.existsBy({
          id: recurso_curso_modalidad_id,
        }),
        this.periodoRepository.existsBy({ id: periodo_id }),
      ]);
      if (recursoCursoModalidadPeriodoExists)
        throw new ConflictException(
          'Ya existe una asignación de este recurso a este periodo',
        );

      if (!recursoCursoModalidadExists)
        throw new NotFoundException(
          'No existe un recurso curso modalidad con ese id',
        );

      if (!periodoExists)
        throw new NotFoundException('No existe un periodo con ese id');

      const recursoCursoModalidadPeriodo =
        this.recursoCursoModalidadPeriodoRepository.create({
          inicio,
          fin,
          recursoCursoModalidad: { id: recurso_curso_modalidad_id },
          periodo: { id: periodo_id },
        });

      return await this.recursoCursoModalidadPeriodoRepository.save(
        recursoCursoModalidadPeriodo,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al crear recurso curso modalidad periodo',
      );
    }
  }

  async findAll(
    getRecursoCursoModalidadPeriodoDto: GetRecursoCursoModalidadPeriodoDto,
  ) {
    try {
      const { recurso_modalidad_id, periodo_id, page, limit, search } =
        getRecursoCursoModalidadPeriodoDto;

      const query = await this.recursoCursoModalidadPeriodoRepository
        .createQueryBuilder('rcmp')
        .leftJoin('rcmp.recursoCursoModalidad', 'rcm')
        .leftJoin('rcmp.periodo', 'p')
        .leftJoin('rcm.recurso', 'r')
        .leftJoin('rcm.cursoModalidad', 'c')
        .leftJoin('c.curso', 'curso')
        .select([
          'rcmp.id',
          'rcmp.inicio',
          'rcmp.fin',
          'rcm.id',
          'p.id',
          'p.nombre',
        ])
        .addSelect('COUNT(*) OVER()', 'total_count');

      if (search && search.trim() !== '') {
        query.andWhere('r.nombre LIKE :search ', {
          search: `%${search}%`,
        });
        query.andWhere('curso.nombre LIKE :search ', {
          search: `%${search}%`,
        });
        query.andWhere('p.nombre LIKE :search ', {
          search: `%${search}%`,
        });
      }

      if (periodo_id !== undefined) {
        query.andWhere('p.id = :periodo_id', { periodo_id });
      }

      if (recurso_modalidad_id !== undefined) {
        query.andWhere('rcm.id = :recurso_modalidad_id', {
          recurso_modalidad_id,
        });
      }

      const results = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      const totalCount =
        results.length > 0 ? parseInt(results[0].total_count) : 0;

      const formattedResults = results.map((raw) => ({
        id: raw.rcmp_id,
        inicio: raw.rcmp_inicio,
        fin: raw.rcmp_fin,
        recursoCursoModalidad: {
          id: raw.rcm_id,
        },
        periodo: {
          id: raw.p_id,
          nombre: raw.p_nombre,
        },
      }));

      return {
        results: formattedResults,
        meta: {
          count: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al recuperar recursos cursos modalidad periodo',
      );
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del recurso curso modalidad periodo no puede estar vacío',
        );
      const recursoCursoModalidadPeriodo =
        await this.recursoCursoModalidadPeriodoRepository.findOneBy({ id });

      if (!recursoCursoModalidadPeriodo)
        throw new NotFoundException(
          'No existe un recurso curso modalidad periodo con ese id',
        );
      return recursoCursoModalidadPeriodo;
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
    updateRecursoCursoModalidadPeriodoDto: UpdateRecursoCursoModalidadPeriodoDto,
  ) {
    try {
      const { inicio, fin, recurso_curso_modalidad_id, periodo_id } =
        updateRecursoCursoModalidadPeriodoDto;

      if (!id) {
        throw new BadRequestException(
          'El ID del recurso curso modalidad periodo no puede estar vacío',
        );
      }

      const [
        idRecursoCursoModalidadPeriodoExists,
        recursoCursoModalidadPeriodoExists,
        recursoCursoModalidadExists,
        periodoExists,
      ] = await Promise.all([
        this.recursoCursoModalidadPeriodoRepository.existsBy({ id }),
        this.recursoCursoModalidadPeriodoRepository.existsBy({
          id: Not(id),
          recursoCursoModalidad: { id: recurso_curso_modalidad_id },
          periodo: { id: periodo_id },
        }),
        this.recursoCursoModalidadRepository.existsBy({
          id: recurso_curso_modalidad_id,
        }),
        this.periodoRepository.existsBy({ id: periodo_id }),
      ]);
      if (!idRecursoCursoModalidadPeriodoExists)
        throw new NotFoundException(
          'No existe un recurso curso modalidad periodo con ese id',
        );

      if (!recursoCursoModalidadExists)
        throw new NotFoundException(
          'No existe un recurso curso modalidad con ese id',
        );

      if (!periodoExists)
        throw new NotFoundException('No existe un periodo con ese id');

      if (recursoCursoModalidadPeriodoExists)
        throw new ConflictException(
          'Ya existe una asignación de este recurso a este periodo',
        );

      const updateData: Partial<RecursoCursoModalidadPeriodo> & {
        periodo?: any;
      } & { recursoCursoModalidad?: any } = {};

      if (inicio !== undefined) {
        updateData.inicio = inicio;
      }

      if (fin !== undefined) {
        updateData.fin = fin;
      }

      if (recurso_curso_modalidad_id !== undefined) {
        updateData.recursoCursoModalidad = { id: recurso_curso_modalidad_id };
      }

      if (periodo_id !== undefined) {
        updateData.periodo = { id: periodo_id };
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException(
          'No hay datos para actualizar el recurso curso modalidad periodo',
        );
      }

      await this.recursoCursoModalidadPeriodoRepository.update(id, updateData);
      return await this.recursoCursoModalidadPeriodoRepository.findOneBy({
        id,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar recurso curso modalidad periodo',
      );
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del recurso curso modalidad periodo no puede estar vacío',
        );

      const result = await this.recursoCursoModalidadPeriodoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException(
          'Recurso curso modalidad periodo no encontrado',
        );

      return this.recursoCursoModalidadPeriodoRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        'Error al deshabilitar/habilitar recurso curso modalidad periodo',
      );
    }
  }
}
