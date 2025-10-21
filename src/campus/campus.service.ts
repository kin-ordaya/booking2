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
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class CampusService {
  constructor(
    @InjectPinoLogger(CampusService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(Campus)
    private campusRepository: Repository<Campus>,
  ) {}

  async create(createCampusDto: CreateCampusDto) {
    try {
      const { codigo } = createCampusDto;
      this.logger.info({
        operation: 'create_started',
        entity: 'campus',
      });

      const campusExists = await this.campusRepository.findOne({
        where: { codigo },
      });

      if (campusExists) {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'campus',
            reason: 'campus_exists',
            campusId: campusExists.id || 'unknown',
          },
          'Ya existe un campus con ese codigo',
        );
        throw new ConflictException(' Ya existe un campus con ese codigo');
      }

      const campus = this.campusRepository.create(createCampusDto);

      this.logger.info(
        {
          operation: 'create_success',
          entity: 'campus',
          reason: 'create_success',
          campusId: campus.id || 'unknown',
        },
        'Campus creado exitosamente',
      );

      return await this.campusRepository.save(campus);
    } catch (error) {
      this.logger.error(
        {
          operation: 'create_error',
          entity: 'campus',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de creación de campus',
      );
      throw error;
    }
  }

  async findAll() {
    try {
      this.logger.info(
        {
          operation: 'find_all_started',
          entity: 'campus',
        },
        'Iniciando búsqueda de campus',
      );

      const query = await this.campusRepository.find({ order: { nombre: 'ASC' } });

      this.logger.info(
        {
          operation: 'find_all_success',
          entity: 'campus',
        },
        'Campus encontrado exitosamente',
      );
      
      return query
    } catch (error) {
      this.logger.error(
        {
          operation: 'find_all_error',
          entity: 'campus',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de búsqueda de campus',
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      this.logger.info(
        {
          operation: 'find_one_started',
          entity: 'campus',
          campusId: id || 'unknown',
        },
        'Iniciando búsqueda de campus',
      );

      if (!id) {
        this.logger.error(
          {
            operation: 'find_one_failed',
            entity: 'campus',
            reason: 'campus_id_empty',
            campusId: id || 'unknown',
          },
          'El ID del campus no puede estar vacío',
        );

        throw new BadRequestException('Campus id no puede estar vacío');
      }

      const campus = await this.campusRepository.findOneBy({ id });

      if (!campus) {
        this.logger.error(
          {
            operation: 'find_one_failed',
            entity: 'campus',
            reason: 'campus_not_found',
            campusId: id || 'unknown',
          },
          `Campus con id ${id} no encontrado`,
        );

        throw new NotFoundException(`Campus con id ${id} no encontrado`);
      }

      this.logger.info(
        {
          operation: 'find_one_success',
          entity: 'campus',
          campusId: id || 'unknown',
        },
        'Campus encontrado exitosamente',
      );

      return campus;
    } catch (error) {
      this.logger.error(
        {
          operation: 'find_one_error',
          entity: 'campus',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de búsqueda de campus',
      );
      throw error;
    }
  }

  async update(id: string, updateCampusDto: UpdateCampusDto) {
    try {
      const { nombre, codigo } = updateCampusDto;

      this.logger.info(
        {
          operation: 'update_started',
          entity: 'campus',
          campusId: id || 'unknown',
        },
        'Iniciando actualización de campus',
      );

      if (!id) {
        this.logger.error(
          {
            operation: 'update_failed',
            entity: 'campus',
            reason: 'campus_id_empty',
            campusId: id || 'unknown',
          },
          'El ID del campus no puede estar vacío',
        );

        throw new BadRequestException('Campus id no puede estar vacío');
      }

      const campus = await this.campusRepository.findOneBy({ id });

      if (!campus) {
        this.logger.error(
          {
            operation: 'update_failed',
            entity: 'campus',
            reason: 'campus_not_found',
            campusId: id || 'unknown',
          },
          `Campus con id ${id} no encontrado`,
        );

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
          this.logger.error(
            {
              operation: 'update_failed',
              entity: 'campus',
              reason: 'campus_codigo_exists',
              campusId: id || 'unknown',
            },
            'Ya existe un campus con ese codigo',
          );

          throw new ConflictException('Ya existe un campus con ese codigo');
        }
        updateData.codigo = codigo;
      }

      if (Object.keys(updateData).length === 0) {
        return campus;
      }

      await this.campusRepository.update(id, updateData);

      this.logger.info(
        {
          operation: 'update_success',
          entity: 'campus',
          campusId: id || 'unknown',
        },
        'Campus actualizado exitosamente',
      );

      return await this.campusRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Ocurrio un error inesperado',
        details: error.message,
      });
    }
  }

  async remove(id: string) {
    try {
      this.logger.info(
        {
          operation: 'remove_started',
          entity: 'campus',
          campusId: id || 'unknown',
        },
        'Iniciando eliminación de campus',
      );

      if (!id) {
        this.logger.error(
          {
            operation: 'remove_failed',
            entity: 'campus',
            reason: 'campus_id_empty',
            campusId: id || 'unknown',
          },
          'El ID del campus no puede estar vacío',
        );

        throw new BadRequestException('El ID del campus no puede estar vacío');
      }

      const result = await this.campusRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();
      if (result.affected === 0) {
        this.logger.error(
          {
            operation: 'remove_failed',
            entity: 'campus',
            reason: 'campus_not_found',
            campusId: id || 'unknown',
          },
          `Campus con id ${id} no encontrado`,
        );

        throw new NotFoundException('Campus no encontrado');
      }

      this.logger.info(
        {
          operation: 'remove_success',
          entity: 'campus',
          campusId: id || 'unknown',
        },
        'Campus eliminado exitosamente',
      );

      return this.campusRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(
        {
          operation: 'remove_error',
          entity: 'campus',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de eliminación de campus',
      );
      throw error;
    }
  }
}
