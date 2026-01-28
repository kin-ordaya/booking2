import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { Not, Repository } from 'typeorm';
import { CursoModalidad } from 'src/curso_modalidad/entities/curso_modalidad.entity';
import { RecursoDocenteClaseDto } from './dto/recurso-docente-clase.dto';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Periodo } from 'src/periodo/entities/periodo.entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClaseService {
  constructor(
    @InjectPinoLogger(ClaseService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,
    @InjectRepository(CursoModalidad)
    private readonly cursoModalidadRepository: Repository<CursoModalidad>,
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,
    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
    private readonly config: ConfigService,
  ) {}

  async create(createClaseDto: CreateClaseDto) {
    const operation = 'create_clase';
    const startTime = Date.now();
    try {
      const {
        nrc,
        nrc_secundario,
        inscritos,
        tipo,
        codigo_cruzado,
        inicio,
        fin,
        curso_modalidad_id,
        periodo_id,
      } = createClaseDto;

      this.logger.info(
        {
          operation,
          entity: 'clase',
          phase: 'validation',
          reason: 'create_started',
          nrc,
          curso_modalidad_id,
          periodo_id,
        },
        'Iniciando creación de clase',
      );

      const cursoModalidadExists = await this.cursoModalidadRepository.existsBy(
        { id: curso_modalidad_id },
      );

      if (!cursoModalidadExists) {
        this.logger.warn(
          {
            operation,
            entity: 'clase',
            phase: 'validation_failed',
            reason: 'curso_modalidad_not_found',
            curso_modalidad_id,
          },
          'No existe un curso modalidad con id ' + curso_modalidad_id,
        );

        throw new NotFoundException('No existe un curso modalidad con id ' + curso_modalidad_id);
      }

      const periodoExists = await this.periodoRepository.existsBy({
        id: periodo_id,
      });

      if (!periodoExists) {
        this.logger.error(
          {
            operation,
            entity: 'clase',
            phase: 'validation_failed',
            reason: 'periodo_not_found',
            periodo_id,
          },
          'No existe un periodo con ese id',
        );
        throw new NotFoundException('No existe un periodo con ese id');
      }
      // si ya existe una clase con ese nrc y en el mismo semestre, se devuelve error
      const claseExists = await this.claseRepository.findOne({
        where: { nrc, periodo: { id: periodo_id } },
        relations: ['periodo'],
      });

      if (claseExists) {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'clase',
            reason: 'clase_exists',
            existing_clase_id: claseExists.id,
            nrc,
            periodo_id,
          },
          'Ya existe una clase con ese nrc en el mismo periodo',
        );
        throw new NotFoundException(
          'Ya existe una clase con ese nrc en el mismo periodo',
        );
      }

      const clase = this.claseRepository.create({
        nrc,
        nrc_secundario,
        inscritos,
        tipo,
        codigo_cruzado,
        inicio,
        fin,
        cursoModalidad: { id: curso_modalidad_id },
        periodo: { id: periodo_id },
      });
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'clase',
          phase: 'success',
          reason: 'create_success',
          clase_id: clase.id,
        },
        'Clase creada exitosamente',
      );

      return await this.claseRepository.save(clase);
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'clase',
          phase: 'error',
          error_type: error.constructor.name,
          error_message: error.message,
          stack_trace:
            this.config.get('NODE_ENV') === 'development' ? error.stack : undefined,
          duration,
          timestamp: new Date().toISOString(),
        },
        'Error en proceso de creación de clase',
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear clase');
    }
  }

  async findAll() {
    const operation = 'find_all_clases';

    try {
      const query = await this.claseRepository.find({ order: { nrc: 'ASC' } });

      this.logger.debug(
        {
          operation,
          entity: 'clase',
          count: query.length,
        },
        'Clases recuperadas exitosamente',
      );

      return query;
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'clase',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        'Error en proceso de búsqueda de clases',
      );
      throw new InternalServerErrorException('Error al recuperar clases');
    }
  }

  async findOne(id: string) {
    const operation = 'find_one_clase';

    try {
      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'clase',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'El ID de la clase vacío',
        );

        throw new BadRequestException('El ID de la clase no puede estar vacío');
      }

      const clase = await this.claseRepository.findOne({
        where: { id },
        relations: ['cursoModalidad', 'periodo'],
      });

      if (!clase) {
        this.logger.warn(
          {
            operation,
            entity: 'clase',
            reason: 'clase_not_found',
            clase_id: id,
          },
          `Clase con id ${id} no encontrado`,
        );
        throw new NotFoundException(`Clase con id ${id} no encontrado`);
      }

      this.logger.debug(
        {
          operation,
          entity: 'clase',
          clase_id: id,
        },
        'Clase encontrada exitosamente',
      );
      return clase;
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'clase',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        `Error al recuperar clase ${id}`,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al recuperar clase');
    }
  }

  async getClasesByRecursoDocente(
    recursoDocenteClaseDto: RecursoDocenteClaseDto,
  ) {
    const operation = 'get_clases_by_recurso_docente';
    try {
      const { recurso_id, rol_usuario_id } = recursoDocenteClaseDto;

      // 1. Verificaciones iniciales
      const [recursoExists, rolUsuarioExists] = await Promise.all([
        this.recursoRepository.existsBy({ id: recurso_id }),
        this.rolUsuarioRepository.findOne({
          where: { id: rol_usuario_id },
          relations: ['rol', 'usuario'],
        }),
      ]);

      if (!recursoExists) {
        this.logger.warn(
          {
            operation,
            entity: 'clase',
            phase: 'validation_failed',
            reason: 'recurso_not_found',
            recurso_id,
          },
          'No existe un recurso con ese id',
        );
        throw new NotFoundException('No existe un recurso con ese id');
      }

      if (!rolUsuarioExists) {
        this.logger.warn(
          {
            operation,
            entity: 'clase',
            phase: 'validation_failed',
            reason: 'rol_usuario_not_found',
            rol_usuario_id,
          },
          'No existe un docente con ese id',
        );

        throw new NotFoundException('No existe un docente con ese id');
      }

      if (rolUsuarioExists.rol.nombre !== 'DOCENTE') {
        this.logger.warn(
          {
            operation,
            entity: 'clase',
            phase: 'validation_failed',
            reason: 'rol_usuario_not_docente',
            rol_usuario_id,
          },
          'El usuario no tiene rol de DOCENTE',
        );

        throw new BadRequestException('El usuario no tiene rol de DOCENTE');
      }

      // 2. Consulta principal con todas las relaciones necesarias
      const query = this.claseRepository
        .createQueryBuilder('clase')
        // Relación con docente
        .innerJoin('clase.responsable', 'responsable')
        .innerJoin(
          'responsable.rolUsuario',
          'rolUsuario',
          'rolUsuario.id = :rolUsuarioId',
          { rolUsuarioId: rol_usuario_id },
        )
        // Relación con curso (IMPORTANTE: innerJoinAndSelect para cargar los datos)
        .innerJoinAndSelect('clase.cursoModalidad', 'cursoModalidad')
        .innerJoinAndSelect('cursoModalidad.curso', 'curso')
        // Relación con recurso
        .innerJoin('curso.recurso_curso', 'recursoCurso')
        .innerJoin(
          'recursoCurso.recurso',
          'recurso',
          'recurso.id = :recursoId',
          { recursoId: recurso_id },
        )
        // Conteo de matriculados
        .loadRelationCountAndMap(
          'clase.matriculadosCount',
          'clase.matricula_clase',
          'matricula',
          (qb) => qb.andWhere('matricula.estado = 1'),
        )
        // Selección de campos
        .select([
          'clase.id',
          'clase.nrc',
          'clase.inicio',
          'clase.fin',
          'clase.inscritos',
          'curso.id',
          'curso.codigo',
          'curso.nombre',
          'cursoModalidad.id',
        ])
        .orderBy('clase.periodo', 'DESC')
        .addOrderBy('clase.inicio', 'DESC');

      // 3. Ejecutar consulta y mapear resultados
      const clases = await query.getMany();

      // 4. Formatear respuesta final
      return clases.map((clase) => {
        // Verificar que las relaciones existen
        if (!clase.cursoModalidad || !clase.cursoModalidad.curso) {
          this.logger.warn({
            operation,
            entity: 'clase',
            phase: 'validation_failed',
            reason: 'curso_not_found',
            curso_modalidad_id: clase.cursoModalidad.id,
          });

          throw new NotFoundException('No existe un curso con ese id');
        }

        this.logger.debug(
          {
            operation,
            entity: 'clase',
            clase_id: clase.id,
          },
          'Clase recuperada exitosamente',
        );

        return {
          id: clase.id,
          nrc: clase.nrc,
          inscritos: clase.inscritos,
          inicio: clase.inicio,
          fin: clase.fin,
          codigo_curso: clase.cursoModalidad.curso.codigo,
          nombre_curso: clase.cursoModalidad.curso.nombre,
        };
      });
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'clase',
          rol_usuario_id: recursoDocenteClaseDto.rol_usuario_id,
          error_type: error.constructor.name,
          error_message: error.message,
        },
        `Error al recuperar las clases del docente ${recursoDocenteClaseDto.rol_usuario_id}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al recuperar clases');
    }
  }

  async findOneByNRC(nrc: string) {
    try {
      if (!nrc)
        throw new BadRequestException('El ID del recurso no puede estar vacío');
      return await this.claseRepository.findOneBy({ nrc });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al recuperar clase');
    }
  }

  async update(id: string, updateClaseDto: UpdateClaseDto) {
    const operation = 'update_clase';
    const startTime = Date.now();
    try {
      const {
        nrc,
        nrc_secundario,
        inscritos,
        tipo,
        codigo_cruzado,
        inicio,
        fin,
        curso_modalidad_id,
        periodo_id,
      } = updateClaseDto;

      this.logger.info(
        {
          operation,
          entity: 'clase',
          phase: 'start',
          claseId: id,
          update_fields: Object.keys(updateClaseDto).filter(
            (key) => updateClaseDto[key] !== undefined,
          ),
        },
        'Iniciando actualización de clase',
      );

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'clase',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'El ID de la clase no puede estar vacío',
        );

        throw new BadRequestException('El ID de la clase no puede estar vacío');
      }

      const clase = await this.claseRepository.findOne({
        where: { id },
        relations: ['cursoModalidad'],
      });

      if (!clase) {
        this.logger.warn(
          {
            operation,
            entity: 'clase',
            phase: 'validation_failed',
            reason: 'not_found',
            clase_id: id,
          },
          `Clase con id ${id} no encontrado`,
        );

        throw new NotFoundException(`Clase con id ${id} no encontrado`);
      }

      const updateData: any = {};

      // Validación combinada de nrc y periodo_id
      if (nrc !== undefined || periodo_id !== undefined) {
        const whereConditions: any = { id: Not(id) };

        if (nrc !== undefined) {
          whereConditions.nrc = nrc;
        }

        if (periodo_id !== undefined) {
          whereConditions.periodo = { id: periodo_id };
        } else {
          // Si no se actualiza periodo_id, usar el valor actual
          whereConditions.periodo = { id: clase.periodo.id };
        }

        const claseExists = await this.claseRepository.findOne({
          where: whereConditions,
          relations: ['periodo'],
        });

        if (claseExists) {
          this.logger.warn(
            {
              operation,
              entity: 'clase',
              phase: 'validation_failed',
              reason: 'clase_exists',
              clase_id: id,
              nrc,
              periodo_id,
            },
            'Ya existe una clase con esa combinación de NRC y periodo',
          );

          throw new ConflictException(
            'Ya existe una clase con esa combinación de NRC y periodo',
          );
        }

        // Agregar los valores al updateData
        if (nrc !== undefined) {
          updateData.nrc = nrc;
        }
        if (periodo_id !== undefined) {
          updateData.periodo = { id: periodo_id };
        }
      }

      if (nrc_secundario !== undefined) {
        updateData.nrc_secundario = nrc_secundario;
      }

      if (inscritos !== undefined) {
        updateData.inscritos = inscritos;
      }

      if (tipo !== undefined) {
        updateData.tipo = tipo;
      }

      if (codigo_cruzado !== undefined) {
        updateData.codigo_cruzado = codigo_cruzado;
      }

      // Validación de fechas
      if (inicio !== undefined || fin !== undefined) {
        const fechaInicio =
          inicio !== undefined ? new Date(inicio) : new Date(clase.inicio);
        const fechaFin =
          fin !== undefined ? new Date(fin) : new Date(clase.fin);

        if (fechaInicio >= fechaFin) {
          this.logger.warn(
            {
              operation,
              entity: 'clase',
              phase: 'validation_failed',
              reason: 'invalid_dates',
              clase_id: id,
            },
            'La fecha de inicio debe ser anterior a la fecha de fin',
          );

          throw new BadRequestException(
            'La fecha de inicio debe ser anterior a la fecha de fin',
          );
        }

        if (inicio !== undefined) updateData.inicio = inicio;
        if (fin !== undefined) updateData.fin = fin;
      }

      if (curso_modalidad_id !== undefined) {
        const cursoModalidadExists =
          await this.cursoModalidadRepository.existsBy({
            id: curso_modalidad_id,
          });

        if (!cursoModalidadExists) {
          this.logger.warn(
            {
              operation,
              entity: 'clase',
              phase: 'validation_failed',
              reason: 'curso_modalidad_not_found',
              curso_modalidad_id: curso_modalidad_id,
            },
            'No existe un curso modalidad con ese id',
          );

          throw new NotFoundException(
            'No existe un curso modalidad con ese id',
          );
        }

        updateData.cursoModalidad = { id: curso_modalidad_id };
      }

      if (Object.keys(updateData).length === 0) {
        this.logger.debug(
          {
            operation,
            entity: 'clase',
            clase_id: id,
            phase: 'no_changes',
          },
          'No hay cambios para actualizar',
        );
        return clase;
      }

      await this.claseRepository.update(id, updateData);
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'clase',
          phase: 'success',
          clase_id: id,
          updated_fields: Object.keys(updateData),
          duration,
        },
        'Clase actualizada exitosamente',
      );

      return await this.claseRepository.findOne({
        where: { id },
        relations: ['cursoModalidad'],
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'clase',
          clase_id: id,
          phase: 'error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        'Error en proceso de actualización de clase',
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar clase');
    }
  }

  async remove(id: string) {
    const operation = 'remove_clase';
    const startTime = Date.now();
    try {
      this.logger.warn(
        {
          operation,
          entity: 'clase',
          phase: 'start',
          clase_id: id,
        },
        'Iniciando eliminación de clase',
      );

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'clase',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'El ID de la clase no puede estar vacío',
        );

        throw new BadRequestException('El ID de la clase no puede estar vacío');
      }

      const result = await this.claseRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();
      if (result.affected === 0) {
        this.logger.error(
          {
            operation,
            entity: 'clase',
            phase: 'not_affected',
            clase_id: id,
          },
          'No se afectaron registros al eliminar clase',
        );

        throw new NotFoundException('Clase no encontrada');
      }

      const duration = Date.now() - startTime;

      this.logger.warn(
        {
          operation,
          entity: 'clase',
          phase: 'success',
          clase_id: id,
          duration,
        },
        'Clase eliminada exitosamente',
      );

      return this.claseRepository.findOneBy({ id });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          operation,
          entity: 'clase',
          clase_id: id,
          phase: 'error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        `Error eliminando clase ${id}: ${error.message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar clase');
    }
  }
}
