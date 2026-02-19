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
          this.cursoModalidadRepository.existsBy({
            curso: { id: curso_id },
            modalidad: { id: modalidad_id },
          }),
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
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear curso modalidad');
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
        .leftJoin('cursoModalidad.curso', 'curso')
        .leftJoin('curso.plan', 'plan')
        .leftJoin('cursoModalidad.modalidad', 'modalidad')
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
        ])
        .addSelect('COUNT(*) OVER() AS total_count');

      if (sort_name !== undefined) {
        query.orderBy('curso.nombre', sort_name === 1 ? 'ASC' : 'DESC');
      } else {
        query.orderBy('curso.creacion', 'DESC');
      }

      if (sort_state !== undefined) {
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

      if (search !== undefined && search.trim() !== '') {
        query.andWhere(
          '(UPPER(curso.codigo) LIKE UPPER(:search) OR UPPER(curso.nombre) LIKE UPPER(:search) OR UPPER(modalidad.nombre) LIKE UPPER(:search))',
          { search: `%${search}%` },
        );
      }

      const results = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      const count =
        results.length > 0 ? parseInt(results[0].total_count, 10) : 0;

      const formattedResults = results.map((row) => ({
        id: row.cursoModalidad_id,
        estado: row.cursoModalidad_estado,
        curso: {
          id: row.curso_id,
          codigo: row.curso_codigo,
          nombre: row.curso_nombre,
          creacion: row.curso_creacion,
          plan: {
            id: row.plan_id,
            nombre: row.plan_nombre,
          },
        },
        modalidad: {
          id: row.modalidad_id,
          nombre: row.modalidad_nombre,
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
        'Error al recuperar cursos modalidades',
      );
    }
  }

  async findOne(id: string): Promise<CursoModalidad> {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del cursoModalidad no puede estar vacío',
        );

      const cursoModalidad = await this.cursoModalidadRepository.findOne({
        where: { id },
        relations: ['curso', 'modalidad'],
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
      throw new InternalServerErrorException(
        'Error al recuperar curso modalidad',
      );
    }
  }

  async findOneByIDCursoAndModalidad(curso_id: string, modalidad_id: string) {
    try {
      if (!curso_id || !modalidad_id)
        throw new BadRequestException(
          'El ID del cursoModalidad no puede estar vacío',
        );
      return await this.cursoModalidadRepository.findOne({
        where: {
          curso: { id: curso_id },
          modalidad: { id: modalidad_id },
        },
        relations: ['curso', 'modalidad'],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al recuperar curso modalidad por ID de curso y modalidad',
      );
    }
  }

  async update(id: string, updateCursoModalidadDto: UpdateCursoModalidadDto) {
  try {
    if (!id) {
      throw new BadRequestException('El ID del cursoModalidad no puede estar vacío');
    }

    const { curso_id, modalidad_id } = updateCursoModalidadDto;

    // Buscar cursoModalidad existente
    const cursoModalidad = await this.cursoModalidadRepository.findOne({
      where: { id },
      relations: ['curso', 'modalidad'],
    });

    if (!cursoModalidad) {
      throw new NotFoundException('CursoModalidad no encontrado');
    }

    // Si no hay cambios, retornar el existente
    if (curso_id === undefined && modalidad_id === undefined) {
      return cursoModalidad;
    }

    // Verificar duplicados
    const newCursoId = curso_id ?? cursoModalidad.curso.id;
    const newModalidadId = modalidad_id ?? cursoModalidad.modalidad.id;

    const existingAssignment = await this.cursoModalidadRepository.existsBy({
        id: Not(id),
        curso: { id: newCursoId },
        modalidad: { id: newModalidadId },
    });

    if (existingAssignment) {
      throw new ConflictException('Ya existe una asignación de este curso a esta modalidad');
    }

    // Verificar existencia de curso y modalidad en paralelo si se proporcionaron
    const updateData: any = {};
    const validations: Promise<any>[] = [];

    if (curso_id !== undefined && curso_id !== cursoModalidad.curso.id) {
      validations.push(
        this.cursoRepository.existsBy({ id: curso_id }).then(exists => {
          if (!exists) throw new NotFoundException('No existe un curso con ese id');
          updateData.curso = { id: curso_id };
        })
      );
    }

    if (modalidad_id !== undefined && modalidad_id !== cursoModalidad.modalidad.id) {
      validations.push(
        this.modalidadRepository.existsBy({ id: modalidad_id }).then(exists => {
          if (!exists) throw new NotFoundException('No existe una modalidad con ese id');
          updateData.modalidad = { id: modalidad_id };
        })
      );
    }

    if(validations.length > 0) {
      await Promise.all(validations);
    }

    if(Object.keys(updateData).length === 0) {
      return cursoModalidad;
    }

    // Ejecutar actualización
    await this.cursoModalidadRepository.update(id, updateData);

    // Retornar entidad actualizada
    return await this.cursoModalidadRepository.findOne({
      where: { id },
      relations: ['curso', 'modalidad'],
    });
  } catch (error) {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof ConflictException
    ) {
      throw error;
    }
    throw new InternalServerErrorException('Error al actualizar curso modalidad');
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

      return this.cursoModalidadRepository.findOne({
        where: { id },
        relations: ['curso', 'modalidad'],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        'Error al deshabilitar/habilitar curso modalidad',
      );
    }
  }
}
