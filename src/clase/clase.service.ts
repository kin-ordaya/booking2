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
import { Periodo } from 'src/periodo/entities/periodo.entity';

@Injectable()
export class ClaseService {
  constructor(
    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,
    @InjectRepository(CursoModalidad)
    private readonly cursoModalidadRepository: Repository<CursoModalidad>,
    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
  ) {}

  async create(createClaseDto: CreateClaseDto): Promise<Clase> {
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

      const [cursoModalidadExists, periodoExists, claseExists] =
        await Promise.all([
          this.cursoModalidadRepository.existsBy({ id: curso_modalidad_id }),
          this.periodoRepository.existsBy({ id: periodo_id }),
          this.claseRepository.existsBy({
            nrc,
            periodo: { id: periodo_id },
          }),
        ]);

      if (!cursoModalidadExists) {
        throw new NotFoundException(
          'No existe un curso modalidad con id ' + curso_modalidad_id,
        );
      }

      if (!periodoExists) {
        throw new NotFoundException(
          'No existe un periodo con ese id ' + periodo_id,
        );
      }

      if (claseExists) {
        throw new NotFoundException(
          `Ya existe una clase con nrc ${nrc} y periodo ${periodo_id}`,
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
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear clase');
    }
  }

  async findAll() {
    try {
      const query = await this.claseRepository.find({ order: { nrc: 'ASC' } });

      return query;
    } catch (error) {
      throw new InternalServerErrorException('Error al recuperar clases');
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de la clase vacío');
      }

      const clase = await this.claseRepository.findOne({
        where: { id },
        relations: ['cursoModalidad', 'periodo'],
      });

      if (!clase) {
        throw new NotFoundException(`Clase con ID ${id} no encontrado`);
      }

      return clase;
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

  async getClasesByRecursoDocente(
    recursoDocenteClaseDto: RecursoDocenteClaseDto,
  ) {
    try {
      const { recurso_id, rol_usuario_id } = recursoDocenteClaseDto;

      const clases = await this.claseRepository
        .createQueryBuilder('clase')
        .select([
          'clase.id',
          'clase.nrc',
          'clase.inscritos',
          'clase.inicio',
          'clase.fin',
          'curso.codigo',
          'curso.nombre',
        ])
        .innerJoin('clase.responsable', 'responsable')
        .innerJoin('responsable.rolUsuario', 'rolUsuario')
        .innerJoin('clase.cursoModalidad', 'cursoModalidad')
        .innerJoin('cursoModalidad.curso', 'curso')
        .innerJoin(
          'cursoModalidad.recursoCursoModalidad',
          'recursoCursoModalidad',
        )
        .innerJoin('recursoCursoModalidad.recurso', 'recurso')
        .where('rolUsuario.id = :rolUsuarioId', {
          rolUsuarioId: rol_usuario_id,
        })
        .andWhere('recurso.id = :recursoId', { recursoId: recurso_id })
        .andWhere('clase.estado = 1')
        .andWhere('responsable.estado = 1')
        .andWhere('cursoModalidad.estado = 1')
        .orderBy('clase.periodo', 'DESC')
        .addOrderBy('clase.inicio', 'DESC')
        .getRawMany();

      return clases.map((clase) => ({
        id: clase.clase_id,
        nrc: clase.clase_nrc,
        inscritos: clase.clase_inscritos,
        inicio: clase.clase_inicio,
        fin: clase.clase_fin,
        codigo_curso: clase.curso_codigo,
        nombre_curso: clase.curso_nombre,
      }));
    } catch (error) {
      throw new InternalServerErrorException('Error al recuperar clases');
    }
  }

  async findOneByNRC(nrc: string) {
    try {
      if (!nrc)
        throw new BadRequestException('El ID del recurso no puede estar vacío');
      return await this.claseRepository.findOne({
        where: { nrc },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al recuperar clase');
    }
  }

  async update(id: string, updateClaseDto: UpdateClaseDto) {
    try {
      if (!id) {
        throw new BadRequestException('ID de la clase vacío');
      }

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

      const clase = await this.claseRepository.findOne({
        where: { id },
        relations: ['cursoModalidad'],
      });

      if (!clase) {
        throw new NotFoundException(`Clase con ID ${id} no encontrado`);
      }

      const updateData: any = {};

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
            `Ya existe una clase con nrc ${nrc} y periodo ${periodo_id}`,
          );
        }

        // Agregar los valores al updateData
        if (nrc !== undefined && nrc !== clase.nrc) {
          updateData.nrc = nrc;
        }
        if (periodo_id !== undefined && periodo_id !== clase.periodo.id) {
          updateData.periodo = { id: periodo_id };
        }
      }

      if (
        nrc_secundario !== undefined &&
        nrc_secundario !== clase.nrc_secundario
      ) {
        updateData.nrc_secundario = nrc_secundario;
      }

      if (inscritos !== undefined && inscritos !== clase.inscritos) {
        updateData.inscritos = inscritos;
      }

      if (tipo !== undefined && tipo !== clase.tipo) {
        updateData.tipo = tipo;
      }

      if (
        codigo_cruzado !== undefined &&
        codigo_cruzado !== clase.codigo_cruzado
      ) {
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
            `La fecha de inicio ${inicio} debe ser anterior a la fecha de fin ${fin}`,
          );
        }

        if (inicio !== undefined && inicio !== clase.inicio) {
          updateData.inicio = inicio;
        }
        if (fin !== undefined && fin !== clase.fin) {
          updateData.fin = fin;
        }
      }

      if (
        curso_modalidad_id !== undefined &&
        curso_modalidad_id !== clase.cursoModalidad.id
      ) {
        const cursoModalidadExists =
          await this.cursoModalidadRepository.existsBy({
            id: curso_modalidad_id,
          });

        if (!cursoModalidadExists) {
          throw new NotFoundException(
            'No existe curso modalidad con id ' + curso_modalidad_id,
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
      throw new InternalServerErrorException('Error al actualizar clase');
    }
  }

  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('El ID de clase vacío');
      }

      const claseExists = await this.claseRepository.existsBy({ id });

      if (!claseExists) {
        throw new NotFoundException(`Clase con ID ${id} no encontrada`);
      }

      const result = await this.claseRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(
          'No se afectaron registros al cambiar estado',
        );
      }

      return this.claseRepository.findOne({ where: { id } });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error en la deshabilitación/habilitación de clase',
      );
    }
  }
}
