import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFacultadDto } from './dto/create-facultad.dto';
import { UpdateFacultadDto } from './dto/update-facultad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Facultad } from './entities/facultad.entity';
import { Not, Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class FacultadService {
  constructor(
    @InjectRepository(Facultad)
    private readonly facultadRepository: Repository<Facultad>,
  ) {}

  async create(createFacultadDto: CreateFacultadDto) {
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
      console.error(error);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.facultadRepository.find();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      if (!(await this.facultadRepository.existsBy({ id: id }))) {
        throw new NotFoundException('No existe una facultad con ese id');
      }

      return await this.facultadRepository.findOne({
        where: { id: id },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateFacultadDto: UpdateFacultadDto) {
    try {
      const { nombre } = updateFacultadDto;

      if (!(await this.facultadRepository.existsBy({ id: id }))) {
        throw new NotFoundException('No existe una facultad con ese id');
      }

      if (nombre) {
        if (await this.facultadRepository.existsBy({ id: Not(id), nombre })) {
          throw new ConflictException('Ya existe un facultad con ese nombre');
        }
      }

      await this.facultadRepository.update(id, {
        nombre,
      });

      return await this.facultadRepository.findOneBy({ id });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const updateResult = await this.facultadRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => '1 - estado' }) // Toggle directo en SQL
        .where('id = :id', { id })
        .execute();

      if (updateResult.affected === 0) {
        throw new NotFoundException('Facultad no encontrada');
      }

      return await this.facultadRepository.findOneBy({ id });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
