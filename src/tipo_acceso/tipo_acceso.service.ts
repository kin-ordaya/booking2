import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTipoAccesoDto } from './dto/create-tipo_acceso.dto';
import { UpdateTipoAccesoDto } from './dto/update-tipo_acceso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoAcceso } from './entities/tipo_acceso.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class TipoAccesoService {
  constructor(
    @InjectRepository(TipoAcceso)
    private readonly tipoAccesoRepository: Repository<TipoAcceso>,
  ) {}
  async create(createTipoAccesoDto: CreateTipoAccesoDto): Promise<TipoAcceso> {
    try {
      const { nombre } = createTipoAccesoDto;

      if (await this.tipoAccesoRepository.existsBy({ nombre })) {
        throw new ConflictException('Ya existe un tipoAcceso con ese nombre');
      }

      const tipoAcceso = this.tipoAccesoRepository.create({
        nombre,
      });

      return await this.tipoAccesoRepository.save(tipoAcceso);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.tipoAccesoRepository.find({
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
          'El ID de la tipoAcceso no puede estar vacío',
        );

      const tipoAcceso = await this.tipoAccesoRepository.findOneBy({ id });
      if (!tipoAcceso) throw new NotFoundException('TipoAcceso no encontrada');
      return tipoAcceso;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateTipoAccesoDto: UpdateTipoAccesoDto) {
    try {
      const { nombre } = updateTipoAccesoDto;

      if (!id)
        throw new BadRequestException(
          'El ID de la tipoAcceso no puede estar vacío',
        );

      const tipoAcceso = await this.tipoAccesoRepository.findOneBy({ id });
      if (!tipoAcceso) {
        throw new NotFoundException('TipoAcceso no encontrada');
      }

      const updateData: any = {};

      if (nombre !== undefined) {
        const nombreExists = await this.tipoAccesoRepository.existsBy({
          id: Not(id),
          nombre,
        });

        if (nombreExists) {
          throw new ConflictException(
            'Ya existe una tipoAcceso con ese nombre',
          );
        }

        updateData.nombre = nombre;
      }

      if (Object.keys(updateData).length === 0) {
        return tipoAcceso;
      }

      await this.tipoAccesoRepository.update(id, {
        nombre,
      });
      return await this.tipoAccesoRepository.findOneBy({ id });
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
          'El ID de la tipoAcceso no puede estar vacío',
        );

      const result = await this.tipoAccesoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('TipoAcceso no encontrada');
      return this.tipoAccesoRepository.findOneBy({ id });
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
