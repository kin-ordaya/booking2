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
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CursoService {
  constructor(
    private readonly config: ConfigService,
    @InjectPinoLogger(CursoService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(Eap)
    private readonly eapRepository: Repository<Eap>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async create(createCursoDto: CreateCursoDto): Promise<Curso> {
    const operation = 'create';
    const startTime = Date.now();

    try {
      const { codigo, eap_id, plan_id } = createCursoDto;

      this.logger.info(
        {
          operation,
          entity: 'curso',
          phase: 'start',
          reason: 'create_started',
          codigo,
          eap_id,
          plan_id,
        },
        'Iniciando creación de curso',
      );

      const [codigoExiste, planExiste, eapExiste] = await Promise.all([
        this.cursoRepository.existsBy({ codigo }),
        this.planRepository.existsBy({ id: plan_id }),
        eap_id ? this.eapRepository.existsBy({ id: eap_id }) : true,
      ]);

      if (codigoExiste) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'curso_exists',
            codigo,
          },
          'Ya existe curso con código ' + codigo,
        );
        throw new ConflictException('Ya existe curso con código ' + codigo);
      }

      if (!planExiste) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'plan_not_found',
            plan_id,
          },
          'No existe plan con ID ' + plan_id,
        );
        throw new NotFoundException('No existe plan con ID ' + plan_id);
      }

      if (eap_id && !eapExiste) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'eap_not_found',
            eap_id,
          },
          'No existe EAP con ese ID ' + eap_id,
        );
        throw new NotFoundException('No existe EAP con ese ID ' + eap_id);
      }

      // Creación del curso
      const curso = this.cursoRepository.create({
        ...createCursoDto,
        eap: eap_id ? { id: eap_id } : undefined,
        plan: { id: plan_id },
      });

      const savedCurso = await this.cursoRepository.save(curso);
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'curso',
          phase: 'success',
          reason: 'create_success',
          curso_id: curso.id,
          codigo: curso.codigo,
          codigo_cruzado: curso?.codigo_cruzado,
          nombre: curso.nombre,
          descripcion: curso?.descripcion,
          eap_id: curso.eap?.id,
          plan_id: curso.plan.id,
          duration,
        },
        'Curso creado exitosamente',
      );

      return savedCurso;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'curso',
          phase: 'error',
          reason: 'create_error',
          error_type: error.constructor.name,
          error_message: error.message,
          stack_trace:
            this.config.get('NODE_ENV') === 'development'
              ? error.stack
              : undefined,
          duration,
        },
        'Error en proceso de creación de curso',
      );
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
    const operation = 'find_all';
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

      this.logger.debug(
        {
          operation,
          entity: 'curso',
          count,
        },
        'Cursos encontrados exitosamente',
      );

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
      this.logger.error(
        {
          operation,
          entity: 'curso',
          phase: 'error',
          reason: 'find_all_error',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        'Error al recuperar cursos',
      );

      throw new InternalServerErrorException('Error al recuperar cursos');
    }
  }

  // async getCursosByRecursoDocente(
  //   recursoDocenteCursoDto: RecursoDocenteCursoDto,
  // ) {
  //   try {
  //     const { recurso_id, rol_usuario_id } = recursoDocenteCursoDto;

  //     // Verificaciones iniciales (se mantienen igual)
  //     const [recursoExists, rolUsuarioExists] = await Promise.all([
  //       this.recursoRepository.existsBy({ id: recurso_id }),
  //       this.rolUsuarioRepository.findOne({
  //         where: { id: rol_usuario_id },
  //         relations: ['rol'],
  //       }),
  //     ]);

  //     if (!recursoExists) throw new NotFoundException('No existe un recurso con ese id');
  //     if (!rolUsuarioExists) throw new NotFoundException('No existe un docente con ese id');
  //     if (rolUsuarioExists.rol.nombre !== 'DOCENTE') {
  //       throw new BadRequestException('El usuario no tiene rol de DOCENTE');
  //     }

  //     // Consulta principal corregida
  //     return await this.cursoRepository
  //       .createQueryBuilder('curso')
  //       // Relación con recurso (para filtrar)
  //       .innerJoin('curso.recurso_curso', 'recursoCurso')
  //       .innerJoin('recursoCurso.recurso', 'recurso', 'recurso.id = :recursoId', { recursoId: recurso_id })
  //       // Relación con el docente a través de responsable
  //       .innerJoin('curso.curso_modalidad', 'cursoModalidad')
  //       .innerJoin('cursoModalidad.clase', 'clase')
  //       .innerJoin('clase.responsable', 'responsable')
  //       .innerJoin('responsable.rolUsuario', 'rolUsuario', 'rolUsuario.id = :rolUsuarioId', { rolUsuarioId: rol_usuario_id })
  //       .innerJoin('rolUsuario.rol', 'rol', 'rol.nombre = :rolNombre', { rolNombre: 'DOCENTE' })
  //       .innerJoin('rolUsuario.usuario', 'usuario', 'usuario.estado = 1')
  //       // Selección de campos
  //       .select([
  //         'curso.id',
  //         'curso.codigo',
  //         'curso.nombre',
  //         'curso.estado'])
  //       .getMany();
  //   } catch (error) {
  //     if (error instanceof NotFoundException || error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw error
  //   }
  // }

  async findOne(id: string) {
    const operation = 'find_one';

    try {
      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID de curso vacío',
        );
        throw new BadRequestException('El ID del curso no puede estar vacío');
      }

      const curso = await this.cursoRepository.findOneBy({ id });

      if (!curso) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'not_found',
            curso_id: id,
          },
          `Curso con ID ${id} no encontrado`,
        );
        throw new NotFoundException(`Curso con ID ${id} no encontrado`);
      }

      this.logger.debug(
        {
          operation,
          entity: 'curso',
          curso_id: curso.id,
        },
        'Curso recuperado exitosamente',
      );
      return curso;
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'curso',
          curso_id: id,
          phase: 'error',
          reason: 'find_one_error',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        `Error al recuperar curso ${id}`,
      );

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
    const operation = 'find_one_by_codigo';
    try {
      if (!codigo) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'empty_codigo',
          },
          'Codigo de curso no puede estar vacío',
        );
        throw new BadRequestException('Codigo de curso no puede estar vacío');
      }

      const curso = await this.cursoRepository.findOneBy({ codigo });
      if (!curso) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'not_found',
            curso_codigo: codigo,
          },
          `Curso con codigo ${codigo} no encontrado`,
        );
        throw new NotFoundException('Curso no encontrado');
      }
      this.logger.debug(
        {
          operation,
          entity: 'curso',
          curso_codigo: curso.codigo,
        },
        'Curso recuperado exitosamente',
      );
      return curso;
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'curso',
          curso_codigo: codigo,
          phase: 'error',
          reason: 'find_one_by_codigo_error',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        `Error al recuperar curso con codigo ${codigo}`,
      );
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
    const operation = 'update';
    const startTime = Date.now();

    try {
      const { codigo, nombre, descripcion, eap_id, plan_id } = updateCursoDto;

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID de curso vacío',
        );
        throw new BadRequestException('ID del curso  vacío');
      }

      const curso = await this.cursoRepository.findOneBy({ id });
      if (!curso) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'not_found',
            curso_id: id,
          },
          `Curso con ID ${id} no encontrado`,
        );
        throw new NotFoundException(`Curso con ID ${id} no encontrado`);
      }

      const updateData: any = {};

      if (codigo !== undefined) {
        const codigoExistente = await this.cursoRepository.existsBy({
          id: Not(id),
          codigo,
        });

        if (codigoExistente) {
          this.logger.warn(
            {
              operation,
              entity: 'curso',
              phase: 'validation_failed',
              reason: 'curso_exists',
              curso_id: id,
              curso_codigo: codigo,
            },
            'Ya existe curso con codigo ' + codigo,
          );
          throw new ConflictException('Ya existe curso con codigo ' + codigo);
        }
        updateData.codigo = codigo;
      }

      if (eap_id !== undefined) {
        const eapExists = await this.eapRepository.existsBy({
          id: eap_id,
        });

        if (!eapExists) {
          this.logger.warn(
            {
              operation,
              entity: 'curso',
              phase: 'validation_failed',
              reason: 'eap_not_found',
              eap_id,
            },
            'No existe EAP con ID ' + eap_id,
          );
          throw new NotFoundException('No existe EAP con ID ' + eap_id);
        }
        updateData.eap = { id: eap_id };
      }

      if (plan_id !== undefined) {
        const planExists = await this.planRepository.existsBy({
          id: plan_id,
        });

        if (!planExists) {
          this.logger.warn(
            {
              operation,
              entity: 'curso',
              phase: 'validation_failed',
              reason: 'plan_not_found',
              plan_id,
            },
            'No existe plan con ID ' + plan_id,
          );
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
        this.logger.debug(
          {
            operation,
            entity: 'curso',
            curso_id: id,
            phase: 'validation_failed',
            reason: 'no_changes',
          },
          'No hay cambios para actualizar',
        );
        return curso;
      }

      await this.cursoRepository.update(id, updateData);
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'curso',
          phase: 'success',
          reason: 'update_success',
          curso_id: id,
          updated_fields: Object.keys(updateData),
          duration,
        },
        'Curso actualizado exitosamente',
      );

      return await this.cursoRepository.findOneBy({ id });
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'curso',
          curso_id: id,
          phase: 'error',
          reason: 'update_error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        `Error actualizando curso ${id}: ${error.message}`,
      );
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
    const operation = 'remove';
    const startTime = Date.now();
    try {
      this.logger.warn(
        {
          operation,
          entity: 'curso',
          phase: 'start',
          reason: 'remove_started',
          curso_id: id,
        },
        'Iniciando deshabilitación/habilitación de curso',
      );

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID de curso vacío',
        );
        throw new BadRequestException('El ID del curso no puede estar vacío');
      }

      const curso = await this.cursoRepository.findOneBy({ id });

      if (!curso) {
        this.logger.warn(
          {
            operation,
            entity: 'curso',
            phase: 'validation_failed',
            reason: 'not_found',
            curso_id: id,
          },
          `Curso con ID ${id} no encontrado`,
        );
        throw new NotFoundException(`Curso con ID ${id} no encontrado`);
      }

      const result = await this.cursoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        this.logger.error(
          {
            operation,
            entity: 'curso',
            phase: 'no_affected',
            reason: 'not_found',
            curso_id: id,
          },
          'No se afectaron registros al cambiar estado',
        );
        throw new NotFoundException(
          'No se afectaron registros al cambiar estado ',
        );
      }

      const duration = Date.now() - startTime;

      this.logger.warn(
        {
          operation,
          entity: 'curso',
          phase: 'success',
          reason: 'remove_success',
          curso_id: id,
          previous_estado: curso.estado,
          action: curso.estado === 1 ? 'desactivada' : 'reactivada',
          duration,
        },
        `Curso ${curso.estado === 1 ? 'desactivada' : 'reactivada'} exitosamente`,
      );
      return this.cursoRepository.findOneBy({ id });
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'curso',
          curso_id: id,
          phase: 'error',
          reason: 'remove_error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        `Error eliminando curso ${id}: ${error.message}`,
      );

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
