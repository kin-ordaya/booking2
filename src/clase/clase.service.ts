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
  ) {}

  async create(createClaseDto: CreateClaseDto) {
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
          operation: 'create_started',
          entity: 'clase',
        },
        'Iniciando creación de clase',
      );

      const cursoModalidadExists = await this.cursoModalidadRepository.existsBy(
        { id: curso_modalidad_id },
      );

      if (!cursoModalidadExists) {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'clase',
            reason: 'curso_modalidad_not_found',
            curso_modalidad_id: curso_modalidad_id || 'unknown',
          },
          'No existe un curso modalidad con ese id',
        );

        throw new NotFoundException('No existe un curso modalidad con ese id');
      }

      const periodoExists = await this.periodoRepository.existsBy({
        id: periodo_id,
      });

      if (!periodoExists) {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'clase',
            reason: 'periodo_not_found',
            periodo_id: periodo_id || 'unknown',
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
            claseId: claseExists.id || 'unknown',
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

      this.logger.info(
        {
          operation: 'create_success',
          entity: 'clase',
          reason: 'create_success',
          claseId: clase.id || 'unknown',
        },
        'Clase creada exitosamente',
      );

      return await this.claseRepository.save(clase);
    } catch (error) {
      this.logger.error(
        {
          operation: 'create_error',
          entity: 'clase',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de creación de clase',
      );
      throw error;
    }
  }

  async findAll() {
    try {
      this.logger.info(
        {
          operation: 'find_all_started',
          entity: 'clase',
        },
        'Iniciando búsqueda de clases',
      );

      const query = await this.claseRepository.find({ order: { nrc: 'ASC' } });

      this.logger.info(
        {
          operation: 'find_all_success',
          entity: 'clase',
        },
        'Clases encontradas exitosamente',
      );
      return query
    } catch (error) {
      this.logger.error(
        {
          operation: 'find_all_error',
          entity: 'clase',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de búsqueda de clases',
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      this.logger.info(
        {
          operation: 'find_one_started',
          entity: 'clase',
          claseId: id || 'unknown',
        },
        'Iniciando búsqueda de clase',
      );

      if (!id) {
        this.logger.error(
          {
            operation: 'find_one_failed',
            entity: 'clase',
            reason: 'clase_id_empty',
            claseId: id || 'unknown',
          },
          'El ID de la clase no puede estar vacío',
        );

        throw new BadRequestException('El ID de la clase no puede estar vacío');
      }

      const clase = await this.claseRepository.findOne({
        where: { id },
        relations: ['cursoModalidad', 'periodo'],
      });

      if (!clase) {
        this.logger.error(
          {
            operation: 'find_one_failed',
            entity: 'clase',
            reason: 'clase_not_found',
            claseId: id || 'unknown',
          },
          `Clase con id ${id} no encontrado`,
        );
        throw new NotFoundException(`Clase con id ${id} no encontrado`);
      }

      this.logger.info(
        {
          operation: 'find_one_success',
          entity: 'clase',
          claseId: id || 'unknown',
        },
        'Clase encontrada exitosamente',
      );
      return clase;
    } catch (error) {
      this.logger.error(
        {
          operation: 'find_one_error',
          entity: 'clase',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de búsqueda de clase',
      );
      throw error;
    }
  }

  async getClasesByRecursoDocente(
    recursoDocenteClaseDto: RecursoDocenteClaseDto,
  ) {
    try {
      const { recurso_id, rol_usuario_id } = recursoDocenteClaseDto;

      this.logger.info(
        {
          operation: 'get_clases_by_recurso_docente_started',
          entity: 'clase',
        },
        'Iniciando búsqueda de clases por recurso docente',
      );
      // 1. Verificaciones iniciales
      const [recursoExists, rolUsuarioExists] = await Promise.all([
        this.recursoRepository.existsBy({ id: recurso_id }),
        this.rolUsuarioRepository.findOne({
          where: { id: rol_usuario_id },
          relations: ['rol', 'usuario'],
        }),
      ]);

      if (!recursoExists) {
        this.logger.error(
          {
            operation: 'get_clases_by_recurso_docente_failed',
            entity: 'clase',
            reason: 'recurso_not_found',
            recursoId: recurso_id || 'unknown',
          },
          'No existe un recurso con ese id',
        );

        throw new NotFoundException('No existe un recurso con ese id');
      }

      if (!rolUsuarioExists) {
        this.logger.error(
          {
            operation: 'get_clases_by_recurso_docente_failed',
            entity: 'clase',
            reason: 'rol_usuario_not_found',
            rolUsuarioId: rol_usuario_id || 'unknown',
          },
          'No existe un docente con ese id',
        );

        throw new NotFoundException('No existe un docente con ese id');
      }

      if (rolUsuarioExists.rol.nombre !== 'DOCENTE') {
        this.logger.error(
          {
            operation: 'get_clases_by_recurso_docente_failed',
            entity: 'clase',
            reason: 'rol_usuario_not_docente',
            rolUsuarioId: rol_usuario_id || 'unknown',
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
          this.logger.error({
            operation: 'get_clases_by_recurso_docente_failed',
            entity: 'clase',
            reason: 'curso_not_found',
            cursoId: clase.cursoModalidad.id || 'unknown',
          });

          throw new InternalServerErrorException(
            'Error al cargar la información del curso',
          );
        }

        this.logger.info(
          {
            operation: 'get_clases_by_recurso_docente_success',
            entity: 'clase',
            claseId: clase.id || 'unknown',
          },
          'Clase cargada exitosamente',
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
          operation: 'get_clases_by_recurso_docente_error',
          entity: 'clase',
          error: error.message || error || 'unknown',
        },
        'Error al obtener las clases del docente',
      );
      throw error;
    }
  }

  async update(id: string, updateClaseDto: UpdateClaseDto) {
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
      this.logger.info({
        operation: 'update_started',
        entity: 'clase',
        claseId: id || 'unknown',
      })
      
      if (!id) {
        this.logger.error(
          {
            operation: 'update_failed',
            entity: 'clase',
            reason: 'clase_id_empty',
            claseId: id || 'unknown',
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
        this.logger.error(
          {
            operation: 'update_failed',
            entity: 'clase',
            reason: 'clase_not_found',
            claseId: id || 'unknown',
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
          this.logger.error(
            {
              operation: 'update_failed',
              entity: 'clase',
              reason: 'clase_exists',
              claseId: id || 'unknown',
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
          this.logger.error(
            {
              operation: 'update_failed',
              entity: 'clase',
              reason: 'clase_invalid_dates',
              claseId: id || 'unknown',
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
          this.logger.error(
            {
              operation: 'update_failed',
              entity: 'clase',
              reason: 'curso_modalidad_not_found',
              curso_modalidad_id: curso_modalidad_id || 'unknown',
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
        return clase;
      }

      await this.claseRepository.update(id, updateData);

      this.logger.info(
        {
          operation: 'update_success',
          entity: 'clase',
          claseId: id || 'unknown',
        },
        'Clase actualizada exitosamente',
      );

      return await this.claseRepository.findOne({
        where: { id },
        relations: ['cursoModalidad'],
      });
    } catch (error) {
      this.logger.error(
        {
          operation: 'update_error',
          entity: 'clase',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de actualización de clase',
      );
      throw error;
    }
  }

  async remove(id: string) {
    try {
      if (!id) {
        this.logger.error(
          {
            operation: 'remove_failed',
            entity: 'clase',
            reason: 'clase_id_empty',
            claseId: id || 'unknown',
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
            operation: 'remove_failed',
            entity: 'clase',
            reason: 'clase_not_found',
            claseId: id || 'unknown',
          },
          `Clase con id ${id} no encontrado`,
        );

        throw new NotFoundException('Clase no encontrado');
      }

      this.logger.info(
        {
          operation: 'remove_success',
          entity: 'clase',
          claseId: id || 'unknown',
        },
        'Clase eliminada exitosamente',
      );

      return this.claseRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(
        {
          operation: 'remove_error',
          entity: 'clase',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de eliminación de clase',
      );
      throw error;
    }
  }
}
