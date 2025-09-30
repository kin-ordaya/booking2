import { PaginationCursoModalidadDto } from './dto/pagination-curso_modalidad.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCursoModalidadDto } from './dto/create-curso_modalidad.dto';
import { UpdateCursoModalidadDto } from './dto/update-curso_modalidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CursoModalidad } from './entities/curso_modalidad.entity';
import { Repository, Not } from 'typeorm';
import { Modalidad } from 'src/modalidad/entities/modalidad.entity';
import { Curso } from 'src/curso/entities/curso.entity';

@Injectable()
export class CursoModalidadService {
  constructor(
    @InjectRepository(CursoModalidad)
    private readonly cursoModalidadRepository: Repository<CursoModalidad>,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(Modalidad)
    private readonly modalidadRepository: Repository<Modalidad>,
  ) {}

  async create(
    createCursoModalidadDto: CreateCursoModalidadDto,
  ): Promise<CursoModalidad> {
    try {
      const { curso_id, modalidad_id } = createCursoModalidadDto;

      const [cursoModalidadExist, cursoExiste, modalidadExiste] =
        await Promise.all([
          this.cursoModalidadRepository.existsBy({ curso: { id: curso_id, }, modalidad: { id: modalidad_id, } }),
          this.cursoRepository.existsBy({ id: curso_id }),
          this.modalidadRepository.existsBy({ id: modalidad_id }),
        ]);

      if (cursoModalidadExist)
        throw new ConflictException(
          'Ya existe una asignacion de curso a modalidad',
        );

      if (!cursoExiste) throw new NotFoundException('Curso no encontrado');

      if (!modalidadExiste)
        throw new NotFoundException('Modalidad no encontrada');

      const cursoModalidad = this.cursoModalidadRepository.create({
        curso: { id: curso_id },
        modalidad: { id: modalidad_id },
      });
      return await this.cursoModalidadRepository.save(cursoModalidad);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll(paginationCursoModalidadDto: PaginationCursoModalidadDto) {
    try {
      const {
        page,
        limit,
        sort_name,
        sort_state,
        modalidad_id,
        plan_id,
        search,
      } = paginationCursoModalidadDto;

      const query = this.cursoModalidadRepository
        .createQueryBuilder('cursoModalidad')
        .leftJoinAndSelect('cursoModalidad.curso', 'curso')
        .leftJoinAndSelect('curso.plan', 'plan')
        .leftJoinAndSelect('cursoModalidad.modalidad', 'modalidad')
        .select([
          'cursoModalidad.id',
          'cursoModalidad.estado',
          'curso.id',
          'curso.codigo',
          'curso.nombre',
          'curso.creacion',
          'plan.id',
          'plan.nombre',
          'modalidad.id',
          'modalidad.nombre',
        ]);
      
      let orderApplied = false;

      if (sort_name) {
        query.orderBy('curso.nombre', sort_name === 1 ? 'ASC' : 'DESC');
        orderApplied = true;
      }

      if (!orderApplied) {
        query.orderBy('curso.creacion', 'DESC');
      }

      if (sort_state) {
        query.andWhere('cursoModalidad.estado = :estado', {
          estado: sort_state === 1 ? 1 : 0,
        });
      }

      if (modalidad_id?.length) {
        query.andWhere('cursoModalidad.modalidad.id IN (:...modalidad_ids)', {
          modalidad_ids: modalidad_id,
        });
      }

      if (plan_id?.length) {
        query.andWhere('curso.plan.id IN (:...plan_ids)', {
          plan_ids: plan_id,
        });
      }

      if (search) {
        query.andWhere(
          '(UPPER(curso.codigo) LIKE UPPER(:search) OR UPPER(curso.nombre) LIKE UPPER(:search) OR UPPER(modalidad.nombre) LIKE UPPER(:search))',
          { search: `%${search}%` },
        );
      }

      const [results, count] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        results: results.map((item) => ({
          ...item,
          curso: {
            ...item.curso,
            plan: item.curso.plan, // Incluimos el plan en la respuesta
          },
        })),
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

  async findOne(id: string): Promise<CursoModalidad> {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del cursoModalidad no puede estar vacío',
        );

      const cursoModalidad = await this.cursoModalidadRepository.findOneBy({
        id,
      });
      if (!cursoModalidad)
        throw new NotFoundException('CursoModalidad no encontrado');
      return cursoModalidad;
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

  async update(id: string, updateCursoModalidadDto: UpdateCursoModalidadDto) {
    try {
      const { curso_id, modalidad_id } = updateCursoModalidadDto;

      if (!id) {
        throw new BadRequestException(
          'El ID del cursoModalidad no puede estar vacío',
        );
      }

      const cursoModalidad = await this.cursoModalidadRepository.findOne({
        where: { id },
        relations: ['curso', 'modalidad'],
      });
      if (!cursoModalidad) {
        throw new NotFoundException('CursoModalidad no encontrado');
      }

      const newCursoId =
        curso_id !== undefined ? curso_id : cursoModalidad.curso.id;
      const newModalidadId =
        modalidad_id !== undefined ? modalidad_id : cursoModalidad.modalidad.id;

      if (curso_id !== undefined) {
        const cursoExists = await this.cursoRepository.existsBy({
          id: curso_id,
        });
        if (!cursoExists) {
          throw new NotFoundException('No existe un curso con ese id');
        }
      }

      if (modalidad_id !== undefined) {
        const modalidadExists = await this.modalidadRepository.existsBy({
          id: modalidad_id,
        });
        if (!modalidadExists) {
          throw new NotFoundException('No existe una modalidad con ese id');
        }
      }

      const existingAssignment = await this.cursoModalidadRepository.findOne({
        where: {
          id: Not(id),
          curso: { id: newCursoId },
          modalidad: { id: newModalidadId },
        },
      });
      if (existingAssignment) {
        throw new ConflictException(
          'Ya existe una asignación de este curso a este modalidad',
        );
      }

      const updateData: any = {};
      if (curso_id !== undefined) updateData.curso = { id: curso_id };
      if (modalidad_id !== undefined)
        updateData.modalidad = { id: modalidad_id };

      await this.cursoModalidadRepository.update(id, updateData);
      
      return await this.cursoModalidadRepository.findOneBy({ id });
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
          'El ID del cursoModalidad no puede estar vacío',
        );

      const result = await this.cursoModalidadRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('CursoModalidad no encontrado');

      return this.cursoModalidadRepository.findOneBy({ id });
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
