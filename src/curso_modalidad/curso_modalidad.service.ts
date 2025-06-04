import { PaginationCursoModalidadDto } from './dto/pagination-curso_modalidad.dto';
import {
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

      const [cursoExiste, modalidadExiste] = await Promise.all([
        this.cursoRepository.existsBy({ id: curso_id }),
        this.modalidadRepository.existsBy({ id: modalidad_id }),
      ]);

      if (!cursoExiste) throw new NotFoundException('Curso no encontrado');

      if (!modalidadExiste)
        throw new NotFoundException('Modalidad no encontrada');

      const cursoModalidad = this.cursoModalidadRepository.create({
        curso: { id: curso_id },
        modalidad: { id: modalidad_id },
      });
      return await this.cursoModalidadRepository.save(cursoModalidad);
    } catch (error) {
      if (error instanceof NotFoundException) {
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
          'curso.id',
          'curso.codigo',
          'curso.nombre',
          'plan.id',
          'plan.nombre',
          'modalidad.id',
          'modalidad.nombre',
        ]);

      if (sort_name) {
        query.orderBy('curso.nombre', sort_name === 1 ? 'ASC' : 'DESC');
      }

      if (sort_state) {
        query.andWhere('cursoModalidad.estado = :estado', {
          estado: sort_state === 1 ? 1 : 0,
        });
      }
      if (modalidad_id) {
        query.andWhere('cursoModalidad.modalidad.id = :modalidad_id', {
          modalidad_id,
        });
      }

      if (plan_id) {
        query.andWhere('curso.plan.id = :plan_id', {
          plan_id,
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

  async findOne(id: string) {
    return `This action returns a #${id} cursoModalidad`;
  }

  async update(id: string, updateCursoModalidadDto: UpdateCursoModalidadDto) {
    return `This action updates a #${id} cursoModalidad`;
  }

  async remove(id: string) {
    return `This action removes a #${id} cursoModalidad`;
  }
}
