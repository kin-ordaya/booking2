import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateModalidadDto } from './dto/create-modalidad.dto';
import { UpdateModalidadDto } from './dto/update-modalidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Modalidad } from './entities/modalidad.entity';
import { In, Not, Repository } from 'typeorm';

@Injectable()
export class ModalidadService {
  constructor(
    @InjectRepository(Modalidad)
    private readonly modalidadRepository: Repository<Modalidad>,
  ) {}

  async create(createModalidadDto: CreateModalidadDto): Promise<Modalidad> {
    try {
      const { nombre } = createModalidadDto;

      if (await this.modalidadRepository.existsBy({ nombre })) {
        throw new ConflictException('Ya existe un modalidad con ese nombre');
      }
      const modalidad = this.modalidadRepository.create({
        nombre,
      });
      return await this.modalidadRepository.save(modalidad);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.modalidadRepository.find({
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string): Promise<Modalidad> {
    try {
      if (!id)
        throw new ConflictException('El ID del modalidad no puede estar vacío');

      const modalidad = await this.modalidadRepository.findOneBy({ id });
      if (!modalidad) throw new NotFoundException('Modalidad no encontrado');
      return modalidad;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateModalidadDto: UpdateModalidadDto) {
    try {
      const { nombre } = updateModalidadDto;

      if (!id) {
        throw new BadRequestException(
          'El ID del modalidad no puede estar vacío',
        );
      }

      const modalidad = await this.modalidadRepository.findOneBy({ id });
      if (!modalidad) {
        throw new NotFoundException('Modalidad no encontrado');
      }

      const updateData: any = {};

      if (nombre !== undefined) {
        const nombreExists = await this.modalidadRepository.existsBy({
          id: Not(id),
          nombre,
        });

        if (nombreExists) {
          throw new ConflictException('Ya existe un modalidad con ese nombre');
        }
        updateData.nombre = nombre;
      }

      if (Object.keys(updateData).length === 0) {
        return modalidad;
      }

      await this.modalidadRepository.update(id, updateData);
      return await this.modalidadRepository.findOneBy({ id });
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
        throw new BadRequestException(
          'El ID del modalidad no puede estar vacío',
        );

      const result = await this.modalidadRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Modalidad no encontrado');
      return this.modalidadRepository.findOneBy({ id });
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
