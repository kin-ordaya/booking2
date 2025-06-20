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

@Injectable()
export class ClaseService {
  constructor(
    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,
    @InjectRepository(CursoModalidad)
    private readonly cursoModalidadRepository: Repository<CursoModalidad>,
  ) {}

  async create(createClaseDto: CreateClaseDto) {
    try {
      const {
        nrc,
        nrc_secundario,
        inscritos,
        periodo,
        tipo,
        inicio,
        fin,
        curso_modalidad_id,
      } = createClaseDto;

      const cursoModalidadExists = await this.cursoModalidadRepository.existsBy(
        { id: curso_modalidad_id },
      );

      if (!cursoModalidadExists) {
        throw new NotFoundException('No existe un curso modalidad con ese id');
      }

      const claseExists = await this.claseRepository.existsBy({ nrc });

      if (claseExists) {
        throw new NotFoundException('Ya existe una clase con ese nrc');
      }

      const clase = this.claseRepository.create({
        nrc,
        nrc_secundario,
        inscritos,
        periodo,
        tipo,
        inicio,
        fin,
        cursoModalidad: { id: curso_modalidad_id },
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
        relations: ['cursoModalidad'],
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

  async update(id: string, updateClaseDto: UpdateClaseDto) {
    try {
      const {
        nrc,
        nrc_secundario,
        inscritos,
        periodo,
        tipo,
        inicio,
        fin,
        curso_modalidad_id,
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

      if (nrc !== undefined) {
        const claseExists = await this.claseRepository.existsBy({
          id: Not(id),
          nrc,
        });
        if (claseExists) {
          throw new ConflictException('Ya existe una clase con ese nrc');
        }
        updateData.nrc = nrc;
      }

      if (nrc_secundario !== undefined) {
        updateData.nrc_secundario = nrc_secundario;
      }

      if (inscritos !== undefined) {
        updateData.inscritos = inscritos;
      }

      if (periodo !== undefined) {
        updateData.periodo = periodo;
      }

      if (tipo !== undefined) {
        updateData.tipo = tipo;
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
