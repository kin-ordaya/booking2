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
      const { codigo, codigo_cruzado, nombre, descripcion, eap_id, plan_id } =
        createCursoDto;

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

      if (!eapExiste) {
        throw new NotFoundException('No existe EAP con ese ID ' + eap_id);
      }

      const curso = this.cursoRepository.create({
        codigo,
        codigo_cruzado,
        nombre,
        descripcion,
        ...(eap_id && { eap: { id: eap_id } }),
        plan: { id: plan_id },
      });

      return await this.cursoRepository.save(curso);
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
        ])
        .addSelect('COUNT(*) OVER()', 'total_count');

      let orderApplied = false;

      if (sort_name !== undefined) {
        query.orderBy('curso.nombre', sort_name === 1 ? 'ASC' : 'DESC');
        orderApplied = true;
      }

      if (!orderApplied) {
        query.orderBy('curso.creacion', 'DESC');
      }

      if (sort_state !== undefined) {
        query.andWhere('curso.estado = :estado', {
          estado: sort_state === 1 ? 1 : 0,
        });
      }

      if (search !== undefined && search.trim() !== '') {
        query.where(
          'UPPER(curso.codigo) LIKE UPPER(:search) OR UPPER(curso.nombre) LIKE UPPER(:search)',
          {
            search: `%${search}%`,
          },
        );
      }

      const results = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      const count =
        results.length > 0 ? parseInt(results[0].total_count, 10) : 0;

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

      const curso = await this.cursoRepository.findOne({
        where: { id },
        relations: ['eap, plan'],
      });

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

      const curso = await this.cursoRepository.findOne({
        where: { codigo },
        relations: ['eap, plan'],
      });
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
      if (!id) {
        throw new BadRequestException('ID del curso  vacío');
      }

      const { codigo, codigo_cruzado, nombre, descripcion, eap_id, plan_id } =
        updateCursoDto;

      const curso = await this.cursoRepository.findOne({
        where: { id },
        relations: ['eap, plan'],
      });

      if (!curso) {
        throw new NotFoundException(`Curso con ID ${id} no encontrado`);
      }

      const updateData: any = {};
      const validations: Promise<any>[] = [];

      if (codigo !== undefined && codigo !== curso.codigo) {
        validations.push(
          this.cursoRepository
            .existsBy({
              id: Not(id),
              codigo,
            })
            .then((exists) => {
              if (exists) {
                throw new ConflictException(
                  'Ya existe curso con codigo ' + codigo,
                );
              }
              updateData.codigo = codigo;
            }),
        );
      }

      if (eap_id !== undefined && eap_id !== curso.eap?.id) {
        validations.push(
          this.eapRepository
            .existsBy({
              id: eap_id,
            })
            .then((exists) => {
              if (!exists) {
                throw new NotFoundException(
                  'No existe un EAP con ese ID ' + eap_id,
                );
              }
              updateData.eap = { id: eap_id };
            }),
        );
      }

      if (plan_id !== undefined && plan_id !== curso.plan.id) {
        validations.push(
          this.planRepository
            .existsBy({
              id: plan_id,
            })
            .then((exists) => {
              if (!exists) {
                throw new NotFoundException(
                  'No existe un plan con ese ID ' + plan_id,
                );
              }
              updateData.plan = { id: plan_id };
            }),
        );
      }

      if (validations.length > 0) {
        await Promise.all(validations);
      }
      if (
        codigo_cruzado !== undefined &&
        codigo_cruzado !== curso.codigo_cruzado
      ) {
        updateData.codigo_cruzado = codigo_cruzado;
      }

      if (nombre !== undefined && nombre !== curso.nombre) {
        updateData.nombre = nombre;
      }

      if (descripcion !== undefined && descripcion !== curso.descripcion) {
        updateData.descripcion = descripcion;
      }

      if (Object.keys(updateData).length === 0) {
        return curso;
      }

      await this.cursoRepository.update(id, updateData);

      return await this.cursoRepository.findOne({
        where: { id },
        relations: ['eap, plan'],
      });
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

      const curso = await this.cursoRepository.existsBy({ id });

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

      return this.cursoRepository.findOne({
        where: { id },
        relations: ['eap, plan'],
      });
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
