import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { Not, Repository } from 'typeorm';
import { PaginationCursoDto } from './dto/pagination.dto';
import { Eap } from 'src/eap/entities/eap.entity';
import { Plan } from 'src/plan/entities/plan.entity';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(Eap)
    private readonly eapRepository: Repository<Eap>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async create(createCursoDto: CreateCursoDto): Promise<Curso> {
    try {
      const { codigo, eap_id, plan_id } = createCursoDto;

      const [codigoExiste, planExiste, eapExiste] = await Promise.all([
        this.cursoRepository.existsBy({ codigo }),
        this.planRepository.existsBy({ id: plan_id }),
        eap_id ? this.eapRepository.existsBy({ id: eap_id }) : true,
      ]);

      if (codigoExiste) {
        throw new ConflictException('Ya existe curso con código ' + codigo);
      }

      if (!planExiste) {
        throw new NotFoundException('No existe plan con ID ' + plan_id);
      }

      if (eap_id && !eapExiste) {
        throw new NotFoundException('No existe EAP con ese ID ' + eap_id);
      }

      // Creación del curso
      const curso = this.cursoRepository.create({
        ...createCursoDto,
        eap: eap_id ? { id: eap_id } : undefined,
        plan: { id: plan_id },
      });

      const savedCurso = await this.cursoRepository.save(curso);

      return savedCurso;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear curso');
    }
  }

  async findAll(paginationCursoDto: PaginationCursoDto) {
    try {
      const { page, limit, sort_name, sort_state, search } = paginationCursoDto;

      const query = this.cursoRepository
        .createQueryBuilder('curso')
        .leftJoinAndSelect('curso.plan', 'plan')
        .select([
          'curso.id',
          'curso.nombre',
          'curso.creacion',
          'curso.codigo',
          'curso.estado',
          'plan.nombre',
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
        query.andWhere('curso.estado = :estado', {
          estado: sort_state === 1 ? 1 : 0,
        });
      }

      if (search) {
        query.where(
          'UPPER(curso.codigo) LIKE UPPER(:search) OR UPPER(curso.nombre) LIKE UPPER(:search)',
          {
            search: `%${search}%`,
          },
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
      throw new InternalServerErrorException('Error al recuperar cursos');
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('El ID del curso no puede estar vacío');
      }

      const curso = await this.cursoRepository.findOneBy({ id });

      if (!curso) {
        throw new NotFoundException(`Curso con ID ${id} no encontrado`);
      }

      return curso;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al recuperar curso');
    }
  }

  async findOneByCodigo(codigo: string): Promise<Curso> {
    try {
      if (!codigo) {
        throw new BadRequestException('Codigo de curso no puede estar vacío');
      }

      const curso = await this.cursoRepository.findOneBy({ codigo });
      if (!curso) {
        throw new NotFoundException('Curso no encontrado');
      }
      return curso;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al recuperar curso');
    }
  }

  async update(id: string, updateCursoDto: UpdateCursoDto) {
    try {
      const { codigo, nombre, descripcion, eap_id, plan_id } = updateCursoDto;

      if (!id) {
        throw new BadRequestException('ID del curso  vacío');
      }

      const curso = await this.cursoRepository.findOneBy({ id });
      if (!curso) {
        throw new NotFoundException(`Curso con ID ${id} no encontrado`);
      }

      const updateData: any = {};

      if (codigo !== undefined) {
        const codigoExistente = await this.cursoRepository.existsBy({
          id: Not(id),
          codigo,
        });

        if (codigoExistente) {
          throw new ConflictException('Ya existe curso con codigo ' + codigo);
        }
        updateData.codigo = codigo;
      }

      if (eap_id !== undefined) {
        const eapExists = await this.eapRepository.existsBy({
          id: eap_id,
        });

        if (!eapExists) {
          throw new NotFoundException('No existe EAP con ID ' + eap_id);
        }
        updateData.eap = { id: eap_id };
      }

      if (plan_id !== undefined) {
        const planExists = await this.planRepository.existsBy({
          id: plan_id,
        });

        if (!planExists) {
          throw new NotFoundException('No existe plan con ID ' + plan_id);
        }
        updateData.plan = { id: plan_id };
      }

      if (nombre !== undefined) {
        updateData.nombre = nombre;
      }

      if (descripcion !== undefined) {
        updateData.descripcion = descripcion;
      }

      if (Object.keys(updateData).length === 0) {
        return curso;
      }

      await this.cursoRepository.update(id, updateData);

      return await this.cursoRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar curso');
    }
  }

  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('El ID del curso no puede estar vacío');
      }

      const curso = await this.cursoRepository.findOneBy({ id });

      if (!curso) {
        throw new NotFoundException(`Curso con ID ${id} no encontrado`);
      }

      const result = await this.cursoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(
          'No se afectaron registros al cambiar estado ',
        );
      }

      return this.cursoRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        'Error en la deshabilitación/habilitación de curso',
      );
    }
  }
}
