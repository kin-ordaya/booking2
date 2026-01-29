import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Aula } from './entities/aula.entity';
import { Not, Repository } from 'typeorm';
import { Pabellon } from 'src/pabellon/entities/pabellon.entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AulaService {
  constructor(
    private readonly config: ConfigService,
    @InjectPinoLogger(AulaService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(Aula)
    private readonly aulaRepository: Repository<Aula>,
    @InjectRepository(Pabellon)
    private readonly pabellonRepository: Repository<Pabellon>,
  ) {}

  async create(createAulaDto: CreateAulaDto) {
    const operation = 'create_aula';
    const startTime = Date.now();

    try {
      const { nombre, codigo, pabellon_id } = createAulaDto;

      this.logger.info(
        {
          operation,
          entity: 'aula',
          phase: 'start',
          reason: 'create_validation',
          nombre,
          codigo,
          pabellon_id,
        },
        'Iniciando creación de aula',
      );

      // Validación 1: Aula existe
      const aulaExists = await this.aulaRepository.findOne({
        where: { nombre, pabellon: { id: pabellon_id } },
        relations: ['pabellon'],
      });

      if (aulaExists) {
        this.logger.warn(
          {
            operation,
            entity: 'aula',
            phase: 'validation_failed',
            reason: 'aula_exists',
            existing_aula_id: aulaExists.id,
            nombre,
            pabellon_id,
          },
          'Ya existe un aula con nombre y pabellón ' + nombre + ' y ' + pabellon_id,
        );
        throw new ConflictException(
          'Ya existe un aula con nombre y pabellón ' + nombre + ' y ' + pabellon_id,
        );
      }

      // Validación 2: Pabellón existe
      const pabellonExists = await this.pabellonRepository.existsBy({
        id: pabellon_id,
      });

      if (!pabellonExists) {
        this.logger.warn(
          {
            operation,
            entity: 'aula',
            phase: 'validation_failed',
            reason: 'pabellon_not_found',
            pabellon_id,
          },
          'No existe un pabellón con ese ID',
        );
        throw new NotFoundException('No existe un pabellón con ese ID');
      }

      // Creación
      const aula = this.aulaRepository.create({
        codigo,
        nombre,
        pabellon: { id: pabellon_id },
      });

      const savedAula = await this.aulaRepository.save(aula);
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'aula',
          phase: 'success',
          aula_id: savedAula.id,
          nombre: savedAula.nombre,
          codigo: savedAula.codigo,
          pabellon_id: savedAula.pabellon.id,
          duration,
        },
        'Aula creada exitosamente',
      );

      return savedAula;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log de error estructurado
      this.logger.error(
        {
          operation,
          entity: 'aula',
          phase: 'error',
          error_type: error.constructor.name,
          error_message: error.message,
          stack_trace:
            this.config.get('NODE_ENV') === 'development' ? error.stack : undefined,
          duration,
          timestamp: new Date().toISOString(),
        },
        `Error en creación de aula: ${error.message}`,
      );

      // Re-lanzar excepciones HTTP conocidas
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear aula');
    }
  }

  async findAll() {
    const operation = 'find_all_aulas';

    try {
      const aulas = await this.aulaRepository.find({
        order: { nombre: 'ASC' },
      });

      this.logger.debug(
        {
          operation,
          entity: 'aula',
          count: aulas.length,
        },
        'Aulas recuperadas exitosamente',
      );

      return aulas;
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'aula',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        'Error al recuperar aulas',
      );

      throw new InternalServerErrorException('Error al recuperar aulas');
    }
  }

  async findOne(id: string) {
    const operation = 'find_one_aula';

    try {
      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'aula',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID de aula vacío',
        );
        throw new BadRequestException('El ID del aula no puede estar vacío');
      }

      const aula = await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });

      if (!aula) {
        this.logger.warn(
          {
            operation,
            entity: 'aula',
            phase: 'validation_failed',
            reason: 'not_found',
            aula_id: id,
          },
          `Aula con ID ${id} no encontrada`,
        );
        throw new NotFoundException(`Aula con id ${id} no encontrada`);
      }

      this.logger.debug(
        {
          operation,
          entity: 'aula',
          aula_id: aula.id,
        },
        'Aula recuperada exitosamente',
      );

      return aula;
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'aula',
          aula_id: id,
          error_type: error.constructor.name,
          error_message: error.message,
        },
        `Error al recuperar aula ${id}`,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al recuperar aula');
    }
  }

  async update(id: string, updateAulaDto: UpdateAulaDto) {
    const operation = 'update_aula';
    const startTime = Date.now();

    try {
      this.logger.info(
        {
          operation,
          entity: 'aula',
          phase: 'start',
          reason: 'update_started',
          aula_id: id,
          update_fields: Object.keys(updateAulaDto).filter(
            (key) => updateAulaDto[key] !== undefined,
          ),
        },
        'Iniciando actualización de aula',
      );

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'aula',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID de aula vacío',
        );
        throw new BadRequestException('ID del aula vacío');
      }

      const aula = await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });

      if (!aula) {
        this.logger.warn(
          {
            operation,
            entity: 'aula',
            phase: 'validation_failed',
            reason: 'not_found',
            aula_id: id,
          },
          `Aula con ID ${id} no encontrada`,
        );
        throw new NotFoundException(`Aula con id ${id} no encontrada`);
      }

      const { nombre, codigo, pabellon_id } = updateAulaDto;
      const updateData: any = {};

      // Validación: Código único (si se actualiza)
      if (codigo !== undefined) {
        const codigoExists = await this.aulaRepository.existsBy({
          id: Not(id),
          codigo,
        });

        if (codigoExists) {
          this.logger.warn(
            {
              operation,
              entity: 'aula',
              phase: 'validation_failed',
              reason: 'duplicate_codigo',
              aula_id: id,
              codigo,
            },
            'Ya existe un aula con ese código ' + codigo,
          );
          throw new ConflictException('Ya existe un aula con ese código ' + codigo);
        }
        updateData.codigo = codigo;
      }

      // Validación: Pabellón existe (si se actualiza)
      if (pabellon_id !== undefined) {
        const pabellonExists = await this.pabellonRepository.existsBy({
          id: pabellon_id,
        });

        if (!pabellonExists) {
          this.logger.warn(
            {
              operation,
              entity: 'aula',
              phase: 'validation_failed',
              reason: 'pabellon_not_found',
              pabellon_id,
            },
            'No existe un pabellón con ese ID ' + pabellon_id,
          );
          throw new NotFoundException('No existe un pabellón con ese ID ' + pabellon_id);
        }
        updateData.pabellon = { id: pabellon_id };
      }

      if (nombre !== undefined) {
        updateData.nombre = nombre;
      }

      // Si no hay cambios, retornar sin hacer nada
      if (Object.keys(updateData).length === 0) {
        this.logger.debug(
          {
            operation,
            entity: 'aula',
            aula_id: id,
            phase: 'validation_failed',
            reason: 'no_changes',
          },
          'No hay cambios para actualizar',
        );
        return aula;
      }

      await this.aulaRepository.update(id, updateData);
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'aula',
          phase: 'success',
          reason: 'update_success',
          aula_id: id,
          updated_fields: Object.keys(updateData),
          duration,
        },
        'Aula actualizada exitosamente',
      );

      return await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'aula',
          aula_id: id,
          phase: 'error',
          reason: 'update_error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        `Error actualizando aula ${id}: ${error.message}`,
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar aula');
    }
  }

  async remove(id: string) {
    const operation = 'remove_aula';
    const startTime = Date.now();

    try {
      this.logger.warn(
        {
          operation,
          entity: 'aula',
          phase: 'start',
          reason: 'remove_started',
          aula_id: id,
        },
        'Iniciando eliminación/desactivación de aula',
      );

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'aula',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID de aula vacío',
        );
        throw new BadRequestException('El ID del aula no puede estar vacío');
      }

      const aula = await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });

      if (!aula) {
        this.logger.warn(
          {
            operation,
            entity: 'aula',
            phase: 'validation_failed',
            reason: 'not_found',
            aula_id: id,
          },
          `Aula con ID ${id} no encontrada`,
        );
        throw new NotFoundException(`Aula con id ${id} no encontrada`);
      }

      const result = await this.aulaRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        this.logger.error(
          {
            operation,
            entity: 'aula',
            phase: 'no_affected',
            aula_id: id,
          },
          'No se afectaron registros al cambiar estado',
        );
        throw new NotFoundException('Aula no encontrada');
      }

      const duration = Date.now() - startTime;
      const newEstado = aula.estado === 1 ? 0 : 1;

      this.logger.warn(
        {
          operation,
          entity: 'aula',
          phase: 'success',
          aula_id: id,
          previous_estado: aula.estado,
          new_estado: newEstado,
          action: aula.estado === 1 ? 'desactivada' : 'reactivada',
          duration,
        },
        `Aula ${aula.estado === 1 ? 'desactivada' : 'reactivada'} exitosamente`,
      );

      return await this.aulaRepository.findOneBy({ id });
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'aula',
          aula_id: id,
          phase: 'error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        `Error eliminando aula ${id}: ${error.message}`,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al eliminar aula');
    }
  }
}