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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CampusService {
  constructor(
    private readonly config: ConfigService,
    @InjectPinoLogger(CampusService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(Campus)
    private campusRepository: Repository<Campus>,
  ) {}

  async create(createCampusDto: CreateCampusDto) {
    const operation = 'create';
    const startTime = Date.now();

    try {
      const { codigo } = createCampusDto;

      this.logger.info(
        {
          operation,
          entity: 'campus',
          phase: 'start',
          reason: 'create_started',
          nombre: createCampusDto.nombre,
          codigo,
        },
        'Iniciando creación de campus',
      );

      const campusExists = await this.campusRepository.findOne({
        where: { codigo },
      });

      if (campusExists) {
        this.logger.warn(
          {
            operation,
            entity: 'campus',
            phase: 'validation_failed',
            reason: 'campus_exists',
            campusId: campusExists.id,
            codigo,
          },
          'Ya existe un campus con codigo ' + codigo,
        );
        throw new ConflictException(
          ' Ya existe un campus con codigo ' + codigo,
        );
      }

      const campus = this.campusRepository.create(createCampusDto);

      const savedCampus = await this.campusRepository.save(campus);
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'campus',
          phase: 'success',
          reason: 'create_success',
          campus_id: campus.id,
          nombre: campus.nombre,
          codigo: campus.codigo,
          duration,
        },
        'Campus creado exitosamente',
      );

      return savedCampus;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'campus',
          phase: 'error',
          reason: 'create_error',
          error_type: error.constructor.name,
          error_message: error.message,
          stack_trace:
            this.config.get('NODE_ENV') === 'development'
              ? error.stack
              : undefined,
          duration,
          timestamp: new Date().toISOString(),
        },
        'Error en creación de campus: ' + error.message,
      );
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
    const operation = 'find_all';

    try {
      const query = await this.campusRepository.find({
        order: { nombre: 'ASC' },
      });

      this.logger.debug(
        {
          operation,
          entity: 'campus',
          count: query.length,
        },
        'Campus recuperados exitosamente',
      );

      return query;
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'campus',
          phase: 'error',
          reason: 'find_all_error',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        'Error al recuperar campus',
      );
      throw new InternalServerErrorException('Error al recuperar campus');
    }
  }

  async findOne(id: string) {
    const operation = 'find_one';

    try {
      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'campus',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID del campus vacío',
        );
        throw new BadRequestException('ID del campus vacío');
      }

      const campus = await this.campusRepository.findOneBy({ id });

      if (!campus) {
        this.logger.warn(
          {
            operation,
            entity: 'campus',
            phase: 'validation_failed',
            reason: 'not_found',
            campus_id: id,
          },
          `Campus con id ${id} no encontrado`,
        );
        throw new NotFoundException(`Campus con id ${id} no encontrado`);
      }

      this.logger.debug(
        {
          operation,
          entity: 'campus',
          campus_id: id,
        },
        'Campus encontrado exitosamente',
      );

      return campus;
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'campus',
          campus_id: id,
          phase: 'error',
          reason: 'find_one_error',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        'Error al recuperar campus ' + id,
      );
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
      return await this.campusRepository.findOneBy({ nombre });
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
    const operation = 'update';
    const startTime = Date.now();

    try {
      const { nombre, codigo } = updateCampusDto;

      this.logger.info(
        {
          operation,
          entity: 'campus',
          phase: 'start',
          reason: 'update_started',
          campus_id: id,
          update_fields: Object.keys(updateCampusDto).filter(
            (key) => updateCampusDto[key] !== undefined,
          ),
        },
        'Iniciando actualización de campus',
      );

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'campus',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID del campus vacío',
        );
        throw new BadRequestException('ID del campus vacío');
      }

      const campus = await this.campusRepository.findOneBy({ id });

      if (!campus) {
        this.logger.warn(
          {
            operation,
            entity: 'campus',
            phase: 'validation_failed',
            reason: 'campus_not_found',
            campus_id: id,
          },
          `Campus con ID ${id} no encontrado`,
        );

        throw new NotFoundException(`Campus con ID ${id} no encontrado`);
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
          this.logger.warn(
            {
              operation,
              entity: 'campus',
              phase: 'validation_failed',
              reason: 'campus_exists',
              campus_id: id,
              codigo,
            },
            'Ya existe un campus con codigo ' + codigo,
          );

          throw new ConflictException(
            'Ya existe un campus con ese codigo ' + codigo,
          );
        }
        updateData.codigo = codigo;
      }

      if (Object.keys(updateData).length === 0) {
        this.logger.debug(
          {
            operation,
            entity: 'campus',
            campus_id: id,
            phase: 'validation_failed',
            reason: 'no_changes',
          },
          'No hay cambios para actualizar',
        );
        return campus;
      }

      await this.campusRepository.update(id, updateData);
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'campus',
          phase: 'success',
          reason: 'update_success',
          campus_id: id,
          updated_fields: Object.keys(updateData),
          duration,
        },
        'Campus actualizado exitosamente',
      );

      return await this.campusRepository.findOneBy({ id });
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'campus',
          campus_id: id,
          phase: 'error',
          reason: 'update_error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        `Error actualizando campus ${id}: ${error.message}`,
      );
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
    const operation = 'remove';
    const startTime = Date.now();

    try {
      this.logger.warn(
        {
          operation,
          entity: 'campus',
          phase: 'start',
          reason: 'remove_started',
          campus_id: id,
        },
        'Iniciando deshabilitación/habilitación de campus',
      );

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'campus',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID del campus vacío',
        );

        throw new BadRequestException('ID del campus vacío');
      }

      const campus = await this.campusRepository.findOneBy({ id });

      if (!campus) {
        this.logger.warn(
          {
            operation,
            entity: 'campus',
            phase: 'validation_failed',
            reason: 'not_found',
            campus_id: id,
          },
          `Campus con ID ${id} no encontrado`,
        );
        throw new NotFoundException(`Campus con ID ${id} no encontrado`);
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
            operation,
            entity: 'campus',
            phase: 'no_affected',
            reason: 'not_found',
            campus_id: id,
          },
          `No se afectaron registros al cambiar estado`,
        );

        throw new NotFoundException('No se afectaron registros al cambiar estado');
      }

      const duration = Date.now() - startTime;

      this.logger.warn(
        {
          operation,
          entity: 'campus',
          phase: 'success',
          reason: 'remove_success',
          campus_id: id,
          previous_estado: campus.estado,
          action: campus.estado === 1 ? 'desactivada' : 'reactivada',
          duration,
        },
        `Campus ${campus.estado === 1 ? 'desactivada' : 'reactivada'} exitosamente`,
      );

      return this.campusRepository.findOneBy({ id });
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'campus',
          campus_id: id,
          phase: 'error',
          reason: 'remove_error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        `Error eliminando campus ${id}: ${error.message}`,
      );
      
      if(
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ){
        throw error;
      }
      throw new InternalServerErrorException('Error en la deshabilitación/habilitación de campus');
    }
  }
}
