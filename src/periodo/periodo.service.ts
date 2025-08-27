import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';
import { Periodo } from './entities/periodo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

@Injectable()
export class PeriodoService {
  constructor(
    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
  ) {}

  async create(createPeriodoDto: CreatePeriodoDto) {
    try {
      const { nombre, inicio, fin } = createPeriodoDto;

      const periodoExists = await this.periodoRepository.existsBy({
        nombre,
      });

      if (periodoExists) {
        throw new ConflictException('Ya existe un periodo con ese nombre');
      }

      if (new Date(inicio) >= new Date(fin)) {
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior a la fecha de fin',
        );
      }

      const periodo = this.periodoRepository.create({
        nombre,
        inicio,
        fin,
      });

      return await this.periodoRepository.save(periodo);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.periodoRepository.find({
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del periodo no puede estar vacío');

      const periodo = await this.periodoRepository.findOne({
        where: { id },
      });
      if (!periodo)
        throw new NotFoundException(`Periodo con id ${id} no encontrado`);

      return periodo;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updatePeriodoDto: UpdatePeriodoDto) {
    try {
      const { nombre, inicio, fin } = updatePeriodoDto;

      if (!id)
        throw new BadRequestException('El ID del periodo no puede estar vacío');

      const periodo = await this.periodoRepository.findOneBy({ id });
      if (!periodo)
        throw new NotFoundException(`Periodo con id ${id} no encontrado`);

      const updateData: any = {};

      if (nombre !== undefined) {
        const periodoExists = await this.periodoRepository.existsBy({
          id: Not(id),
          nombre,
        });
        if (periodoExists) {
          throw new ConflictException('Ya existe un periodo con ese nombre');
        }
        updateData.nombre = nombre;
      }

      // Validación de fechas
      if (inicio !== undefined || fin !== undefined) {
        const fechaInicio =
          inicio !== undefined ? new Date(inicio) : new Date(periodo.inicio);
        const fechaFin =
          fin !== undefined ? new Date(fin) : new Date(periodo.fin);

        // Validar que fin no sea anterior a inicio
        if (fechaFin < fechaInicio) {
          throw new BadRequestException(
            'La fecha de fin no puede ser anterior a la fecha de inicio',
          );
        }

        // Validar que inicio no sea menor que el inicio original
        if (
          inicio !== undefined &&
          new Date(inicio) < new Date(periodo.inicio)
        ) {
          throw new ConflictException(
            'La fecha de inicio debe ser posterior a la fecha original del periodo',
          );
        }

        // Validar que fin no sea menor que el fin original
        if (fin !== undefined && new Date(fin) < new Date(periodo.fin)) {
          throw new ConflictException(
            'La fecha de fin debe ser posterior a la fecha original del periodo',
          );
        }

        // Agregar las fechas al updateData
        if (inicio !== undefined) updateData.inicio = inicio;
        if (fin !== undefined) updateData.fin = fin;
      }

      if (Object.keys(updateData).length === 0) {
        return periodo;
      }

      await this.periodoRepository.update(id, updateData);
      return await this.periodoRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del periodo no puede estar vacío');

      const result = await this.periodoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Periodo no encontrado');

      return this.periodoRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
