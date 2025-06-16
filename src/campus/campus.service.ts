import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Campus } from './entities/campus.entity';
import { Not, Repository } from 'typeorm';
import e from 'express';

@Injectable()
export class CampusService {
  constructor(
    @InjectRepository(Campus)
    private campusRepository: Repository<Campus>,
  ) {}

  async create(createCampusDto: CreateCampusDto) {
    try {
      const { codigo } = createCampusDto;

      const campusExists = await this.campusRepository.findOne({
        where: { codigo },
      });

      if (campusExists) {
        throw new ConflictException(' Ya existe un campus con ese codigo');
      }
      const campus = this.campusRepository.create(createCampusDto);
      return await this.campusRepository.save(campus);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.campusRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Campus id no puede estar vacío');
      }
      const campus = await this.campusRepository.findOneBy({ id });
      if (!campus) {
        throw new NotFoundException(`Campus con id ${id} no encontrado`);
      }
      return campus;
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

  async update(id: string, updateCampusDto: UpdateCampusDto) {
    try {
      const { nombre, codigo } = updateCampusDto;

      if (!id) {
        throw new BadRequestException('Campus id no puede estar vacío');
      }

      const campus = await this.campusRepository.findOneBy({ id });
      if (!campus) {
        throw new NotFoundException(`Campus con id ${id} no encontrado`);
      }
      const updateData: any = {};

      if (nombre !== undefined) {
        updateData.nombre = nombre;
      }

      if (codigo !== undefined) {
        const codigoExists = await this.campusRepository.existsBy({
          id: Not(id),
          codigo,
        });

        if (codigoExists) {
          throw new ConflictException('Ya existe un campus con ese codigo');
        }
        updateData.codigo = codigo;
      }

      if (Object.keys(updateData).length === 0) {
        return campus;
      }

      await this.campusRepository.update(id, updateData);
      return await this.campusRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del campus no puede estar vacío');

      const result = await this.campusRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();
      if (result.affected === 0)
        throw new NotFoundException('Campus no encontrado');
      return this.campusRepository.findOneBy({ id });
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
