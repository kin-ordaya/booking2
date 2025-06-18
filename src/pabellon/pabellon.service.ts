import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePabellonDto } from './dto/create-pabellon.dto';
import { UpdatePabellonDto } from './dto/update-pabellon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pabellon } from './entities/pabellon.entity';
import { Not, Repository } from 'typeorm';
import { Campus } from 'src/campus/entities/campus.entity';

@Injectable()
export class PabellonService {
  constructor(
    @InjectRepository(Pabellon)
    private readonly pabellonRepository: Repository<Pabellon>,
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
  ) {}

  async create(createPabellonDto: CreatePabellonDto) {
    try {
      const { nombre, campus_id } = createPabellonDto;
      const campusExists = await this.campusRepository.existsBy({
        id: campus_id,
      });
      if (!campusExists) {
        throw new ConflictException('No existe un campus con ese id');
      }

      const pabellonExists = await this.pabellonRepository.existsBy({
        nombre,
        campus: { id: campus_id },
      });
      if (pabellonExists) {
        throw new NotFoundException(
          'Ya existe un pabellon con ese nombre y campus',
        );
      }
      const pabellon = this.pabellonRepository.create({
        nombre,
        campus: { id: campus_id },
      });
      return await this.pabellonRepository.save(pabellon);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
    }
  }

  async findAll() {
    try {
      return await this.pabellonRepository.find({
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
          'El ID del pabellon no puede estar vacío',
        );

      const pabellon = await this.pabellonRepository.findOneBy({ id });
      if (!pabellon)
        throw new NotFoundException(`Pabellon con id ${id} no encontrado`);
      return pabellon;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updatePabellonDto: UpdatePabellonDto) {
    try {
      const { nombre, campus_id } = updatePabellonDto;

      if (!id)
        throw new BadRequestException(
          'El ID del pabellon no puede estar vacío',
        );

      const pabellon = await this.pabellonRepository.findOneBy({ id });
      if (!pabellon)
        throw new NotFoundException(`Pabellon con id ${id} no encontrado`);

      const updateData: any = {};
      if (nombre !== undefined) {
        updateData.nombre = nombre;
      }
      if (campus_id !== undefined) {
        const campusExists = await this.campusRepository.existsBy({
          id: campus_id,
        });
        if (!campusExists) {
          throw new ConflictException('No existe un campus con ese id');
        }
        updateData.campus = { id: campus_id };
      }

      if (Object.keys(updateData).length === 0) {
        return pabellon;
      }

      await this.pabellonRepository.update(id, updateData);
      return await this.pabellonRepository.findOneBy({ id });
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
        throw new BadRequestException(
          'El ID del pabellon no puede estar vacío',
        );

      const result = await this.pabellonRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Pabellon no encontrado');

      return this.pabellonRepository.findOneBy({ id });
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
