import { PaginationRecursoCursoDto } from './dto/pagination-recurso_curso.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecursoCursoDto } from './dto/create-recurso_curso.dto';
import { UpdateRecursoCursoDto } from './dto/update-recurso_curso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from 'src/curso/entities/curso.entity';
import { Not, Repository } from 'typeorm';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { RecursoCurso } from './entities/recurso_curso.entity';

@Injectable()
export class RecursoCursoService {
  constructor(
    @InjectRepository(RecursoCurso)
    private readonly recursoCursoRepository: Repository<RecursoCurso>,
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  async create(
    createRecursoCursoDto: CreateRecursoCursoDto,
  ): Promise<RecursoCurso> {
    try {
      const { recurso_id, curso_id } = createRecursoCursoDto;

      const [recursoCursoExists, recursoExists, cursoExists] =
        await Promise.all([
          this.recursoCursoRepository.existsBy({
            curso: { id: curso_id },
            recurso: { id: recurso_id },
          }),
          this.recursoRepository.existsBy({ id: recurso_id }),
          this.cursoRepository.existsBy({ id: curso_id }),
        ]);

      if (recursoCursoExists)
        throw new ConflictException(
          'Ya existe una asignacion de recurso a curso',
        );

      if (!recursoExists)
        throw new NotFoundException('No existe un recurso con ese id');

      if (!cursoExists)
        throw new NotFoundException('No existe un curso con ese id');

      const recursoCurso = this.recursoCursoRepository.create({
        recurso: { id: recurso_id },
        curso: { id: curso_id },
      });
      return await this.recursoCursoRepository.save(recursoCurso);
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

  async findAll(paginationRecursoCursoDto: PaginationRecursoCursoDto) {
    try {
      const { page, limit, search, curso_id } = paginationRecursoCursoDto;

      const query = this.recursoCursoRepository
        .createQueryBuilder('recursoCurso')
        .leftJoinAndSelect('recursoCurso.recurso', 'recurso')
        .leftJoinAndSelect('recursoCurso.curso', 'curso')
        .leftJoinAndSelect('recurso.proveedor', 'proveedor')
        .select([
          'recursoCurso.id',
          'recurso.id',
          'recurso.nombre',
          'recurso.cantidad_credenciales',
          'proveedor.nombre',
          'curso.id as curso_id',
          'curso.nombre as curso_nombre',
        ]);

      if (curso_id) {
        query.andWhere('curso.id = :curso_id', {
          curso_id,
        });
      }

      if (search) {
        query.andWhere('(UPPER(recurso.nombre) LIKE UPPER(:search)', {
          search: `%${search}%`,
        });
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

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del recurso curso no puede estar vacío',
        );

      const recursoCurso = await this.recursoCursoRepository.findOneBy({ id });
      if (!recursoCurso)
        throw new NotFoundException('No existe un recurso curso con ese id');
      return recursoCurso;
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

  async update(id: string, updateRecursoCursoDto: UpdateRecursoCursoDto) {
    try {
      const { recurso_id, curso_id } = updateRecursoCursoDto;

      if (!id) {
        throw new BadRequestException(
          'El ID del recurso curso no puede estar vacío',
        );
      }

      const recursoCurso = await this.recursoCursoRepository.findOne({
        where: { id },
        relations: ['recurso', 'curso'],
      });
      if (!recursoCurso) {
        throw new NotFoundException('No existe un recurso curso con ese id');
      }

      // Preparar datos para actualización y validación
      const newRecursoId =
        recurso_id !== undefined ? recurso_id : recursoCurso.recurso.id;
      const newCursoId =
        curso_id !== undefined ? curso_id : recursoCurso.curso.id;

      // Verificar existencia de recurso y curso (si se están modificando)
      if (recurso_id !== undefined) {
        const recursoExists = await this.recursoRepository.existsBy({
          id: recurso_id,
        });
        if (!recursoExists) {
          throw new NotFoundException('No existe un recurso con ese id');
        }
      }

      if (curso_id !== undefined) {
        const cursoExists = await this.cursoRepository.existsBy({
          id: curso_id,
        });
        if (!cursoExists) {
          throw new NotFoundException('No existe un curso con ese id');
        }
      }

      // Verificar si ya existe la misma asignación (en otros registros)
      const existingAssignment = await this.recursoCursoRepository.findOne({
        where: {
          id: Not(id),
          recurso: { id: newRecursoId },
          curso: { id: newCursoId },
        },
      });
      if (existingAssignment) {
        throw new ConflictException(
          'Ya existe una asignación de este recurso a este curso',
        );
      }

      // Preparar datos de actualización
      const updateData: any = {};
      if (recurso_id !== undefined) updateData.recurso = { id: recurso_id };
      if (curso_id !== undefined) updateData.curso = { id: curso_id };

      // Realizar actualización
      await this.recursoCursoRepository.update(id, updateData);

      return await this.recursoCursoRepository.findOneBy({ id });
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
        throw new BadRequestException(
          'El ID del recurso curso no puede estar vacío',
        );

      const result = await this.recursoCursoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Recurso curso no encontrado');

      return this.recursoCursoRepository.findOneBy({ id });
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
