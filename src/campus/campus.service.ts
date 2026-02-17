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

@Injectable()
export class CampusService {
  constructor(
    @InjectRepository(Campus)
    private campusRepository: Repository<Campus>,
  ) {}

  async create(createCampusDto: CreateCampusDto):Promise<Campus> {
    try {
      const { nombre, codigo } = createCampusDto;

      const campusExists = await this.campusRepository.existsBy({ codigo });

      if (campusExists) {
        throw new ConflictException(
          ' Ya existe un campus con codigo ' + codigo,
        );
      }

      const campus = this.campusRepository.create({
        nombre,
        codigo,
      });

      return await this.campusRepository.save(campus);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear campus');
    }
  }

  async findAll() {
    try {
      const query = await this.campusRepository.find({
        order: { nombre: 'ASC' },
      });

      return query;
    } catch (error) {
      throw new InternalServerErrorException('Error al recuperar campus');
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID del campus vacío');
      }

      const campus = await this.campusRepository.findOne({ where: { id } });

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
      throw new InternalServerErrorException('Error al recuperar campus');
    }
  }

  async findOneByNombre(nombre: string) {
    try {
      if (!nombre)
        throw new BadRequestException(
          'El nombre del campus no puede estar vacío',
        );
      return await this.campusRepository.findOne({ where: { nombre } });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al recuperar campus');
    }
  }

  async update(id: string, updateCampusDto: UpdateCampusDto) {
    try {
      if (!id) {
        throw new BadRequestException('ID del campus vacío');
      }

      const { nombre, codigo } = updateCampusDto;

      const campus = await this.campusRepository.findOne({ where: { id } });

      if (!campus) {
        throw new NotFoundException(`Campus con ID ${id} no encontrado`);
      }

      const updateData: any = {};

      if (nombre !== undefined && nombre !== campus.nombre) {
        updateData.nombre = nombre;
      }

      if (codigo !== undefined && codigo !== campus.codigo) {
        const codigoExists = await this.campusRepository.existsBy({
          id: Not(id),
          codigo,
        });

        if (codigoExists) {
          throw new ConflictException(
            'Ya existe un campus con ese codigo ' + codigo,
          );
        }
        updateData.codigo = codigo;
      }

      if (Object.keys(updateData).length === 0) {
        return campus;
      }

      await this.campusRepository.update(id, updateData);

      return await this.campusRepository.findOne({ where: { id } });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar campus');
    }
  }

  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID del campus vacío');
      }

      const campusExists = await this.campusRepository.existsBy({ id });

      if (!campusExists) {
        throw new NotFoundException(`Campus con ID ${id} no encontrado`);
      }

      const result = await this.campusRepository
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

      return this.campusRepository.findOne({ where: { id } });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error en la deshabilitación/habilitación de campus',
      );
    }
  }
}
