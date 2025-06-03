import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTipoRecursoDto } from './dto/create-tipo_recurso.dto';
import { UpdateTipoRecursoDto } from './dto/update-tipo_recurso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { TipoRecurso } from './entities/tipo_recurso.entity';

@Injectable()
export class TipoRecursoService {
  constructor(
    @InjectRepository(TipoRecurso)
    private readonly tipoRecursoRepository: Repository<TipoRecurso>,
  ) {}

  async create(
    createTipoRecursoDto: CreateTipoRecursoDto,
  ): Promise<TipoRecurso> {
    try {
      const { nombre } = createTipoRecursoDto;

      if (await this.tipoRecursoRepository.existsBy({ nombre })) {
        throw new ConflictException('Ya existe un tipoRecurso con ese nombre');
      }

      const tipoRecurso = this.tipoRecursoRepository.create({
        nombre,
      });
      return await this.tipoRecursoRepository.save(tipoRecurso);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.tipoRecursoRepository.find({
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
          'El ID del tipoRecurso no puede estar vacío',
        );

      const tipoRecurso = await this.tipoRecursoRepository.findOneBy({ id });
      if (!tipoRecurso)
        throw new NotFoundException('TipoRecurso no encontrado');
      return tipoRecurso;
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

  async update(id: string, updateTipoRecursoDto: UpdateTipoRecursoDto) {
    try {
      const { nombre } = updateTipoRecursoDto;

      if (!id)
        throw new BadRequestException(
          'El ID del tipoRecurso no puede estar vacío',
        );

      const tipoRecurso = await this.tipoRecursoRepository.findOneBy({ id });
      if (!tipoRecurso) {
        throw new NotFoundException('TipoRecurso no encontrado');
      }

      const updateData: any = {};

      if (nombre !== undefined) {
        const nombreExists = await this.tipoRecursoRepository.existsBy({
          id: Not(id),
          nombre,
        });

        if (nombreExists) {
          throw new ConflictException(
            'Ya existe un tipoRecurso con ese nombre',
          );
        }

        updateData.nombre = nombre;
      }

      if (Object.keys(updateData).length === 0) {
        return tipoRecurso;
      }

      await this.tipoRecursoRepository.update(id, updateData);

      return await this.tipoRecursoRepository.findOneBy({ id });
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
          'El ID del tipoRecurso no puede estar vacío',
        );

      const result = await this.tipoRecursoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('TipoRecurso no encontrado');
      return this.tipoRecursoRepository.findOneBy({ id });
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
