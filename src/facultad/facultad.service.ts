import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFacultadDto } from './dto/create-facultad.dto';
import { UpdateFacultadDto } from './dto/update-facultad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Facultad } from './entities/facultad.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class FacultadService {
  constructor(
    @InjectRepository(Facultad)
    private readonly facultadRepository: Repository<Facultad>,
  ) {}

  async create(createFacultadDto: CreateFacultadDto): Promise<Facultad> {
    try {
      const { nombre } = createFacultadDto;

      if (await this.facultadRepository.existsBy({ nombre })) {
        throw new ConflictException('Ya existe un facultad con ese nombre');
      }

      const facultad = this.facultadRepository.create({
        nombre,
      });
      return await this.facultadRepository.save(facultad);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.facultadRepository.find({
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
        throw new BadRequestException(
          'El ID de la facultad no puede estar vacío',
        );

      const facultad = await this.facultadRepository.findOneBy({ id });
      if (!facultad) throw new NotFoundException('Facultad no encontrada');
      return facultad;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateFacultadDto: UpdateFacultadDto) {
    try {
      const { nombre } = updateFacultadDto;

      if (!id)
        throw new BadRequestException(
          'El ID de la facultad no puede estar vacío',
        );

      const facultad = await this.facultadRepository.findOneBy({ id });
      if (!facultad) {
        throw new NotFoundException('Facultad no encontrada');
      }

      const updateData: any = {};

      if (nombre !== undefined) {
        const nombreExists = await this.facultadRepository.existsBy({
          id: Not(id),
          nombre,
        });

        if (nombreExists) {
          throw new ConflictException('Ya existe una facultad con ese nombre');
        }

        updateData.nombre = nombre;
      }

      if (Object.keys(updateData).length === 0) {
        return facultad;
      }

      await this.facultadRepository.update(id, {
        nombre,
      });

      return await this.facultadRepository.findOneBy({ id });
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
      if (!id)
        throw new BadRequestException(
          'El ID de la facultad no puede estar vacío',
        );

      const result = await this.facultadRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Facultad no encontrada');
      return this.facultadRepository.findOneBy({ id });
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
