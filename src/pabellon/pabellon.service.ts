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
        throw new NotFoundException('No existe un campus con ese id');
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
      throw new InternalServerErrorException('Error inesperado');
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

      const pabellon = await this.pabellonRepository.findOne({
        where: { id },
        relations: ['campus'],
      });
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

      if (nombre !== undefined || campus_id !== undefined) {
        const whereConditions: any[] = [];

        whereConditions.push({ id: Not(id) });

        if (nombre !== undefined) {
          whereConditions.push({ nombre });
        }

        if (campus_id !== undefined) {
          const campusExists = await this.campusRepository.existsBy({
            id: campus_id,
          });
          if (!campusExists) {
            throw new ConflictException('No existe un campus con ese id');
          }
          whereConditions.push({ campus: { id: campus_id } });
        }

        const existingPabellon = await this.pabellonRepository.findOne({
          where: whereConditions,
        });

        if (existingPabellon) {
          let errorMessage = '';
          if (nombre !== undefined && campus_id !== undefined) {
            errorMessage = 'Ya existe un pabellon con el mismo nombre y campus';
          } else if (nombre !== undefined) {
            errorMessage = 'Ya existe un pabellon con el mismo nombre';
          } else if (campus_id !== undefined) {
            errorMessage =
              'Ya existe un pabellon en el mismo campus (mismo nombre implícito)';
          }
          throw new ConflictException(errorMessage);
        }
      }

      const updateData: any = {};
      if (nombre !== undefined) {
        updateData.nombre = nombre;
      }
      if (campus_id !== undefined) {
        updateData.campus = { id: campus_id };
      }

      if (Object.keys(updateData).length === 0 && nombre === undefined) {
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
