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

@Injectable()
export class ClaseService {
  constructor(
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

      const cursoModalidadExists = await this.cursoModalidadRepository.existsBy(
        { id: curso_modalidad_id },
      );

      if (!cursoModalidadExists) {
        throw new NotFoundException('No existe un curso modalidad con ese id');
      }

      const periodoExists = await this.periodoRepository.existsBy({
        id: periodo_id,
      });

      if (!periodoExists)
        throw new NotFoundException('No existe un periodo con ese id');
      // si ya existe una clase con ese nrc y en el mismo semestre, se devuelve error
      const claseExists = await this.claseRepository.findOne({
        where: { nrc, periodo: { id: periodo_id } },
        relations: ['periodo'],
      });

      if (claseExists) {
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

      return await this.claseRepository.save(clase);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.claseRepository.find({ order: { nrc: 'ASC' } });
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('El ID de la clase no puede estar vacío');
      }
      const clase = await this.claseRepository.findOne({
        where: { id },
        relations: ['cursoModalidad', 'periodo'],
      });
      if (!clase) {
        throw new NotFoundException(`Clase con id ${id} no encontrado`);
      }
      return clase;
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

  async getClasesByRecursoDocente(
    recursoDocenteClaseDto: RecursoDocenteClaseDto,
  ) {
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

      if (!recursoExists)
        throw new NotFoundException('No existe un recurso con ese id');
      if (!rolUsuarioExists)
        throw new NotFoundException('No existe un docente con ese id');
      if (rolUsuarioExists.rol.nombre !== 'DOCENTE') {
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
          throw new InternalServerErrorException(
            'Error al cargar la información del curso',
          );
        }

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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener las clases del docente: ' + error.message,
      );
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

      if (!id) {
        throw new BadRequestException('El ID de la clase no puede estar vacío');
      }

      const clase = await this.claseRepository.findOne({
        where: { id },
        relations: ['cursoModalidad'],
      });
      if (!clase) {
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
      return await this.claseRepository.findOne({
        where: { id },
        relations: ['cursoModalidad'],
      });
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
      if (!id) {
        throw new BadRequestException('El ID de la clase no puede estar vacío');
      }
      const result = await this.claseRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();
      if (result.affected === 0)
        throw new NotFoundException('Clase no encontrado');
      return this.claseRepository.findOneBy({ id });
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
}
