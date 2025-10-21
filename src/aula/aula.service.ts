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

@Injectable()
export class AulaService {
  constructor(
    @InjectPinoLogger(AulaService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(Aula)
    private readonly aulaRepository: Repository<Aula>,
    @InjectRepository(Pabellon)
    private readonly pabellonRepository: Repository<Pabellon>,
  ) {}

  async create(createAulaDto: CreateAulaDto) {
    try {
      const { nombre, codigo, pabellon_id } = createAulaDto;

      this.logger.info(
        {
          operation: 'create_started',
          entity: 'aula',
        },
        'Creando aula',
      );

      const aulaExists = await this.aulaRepository.findOne({
        where: { nombre, pabellon: { id: pabellon_id } },
        relations: ['pabellon'],
      });

      if (aulaExists) {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'aula',
            reason: 'aula_exists',
            aulaId: aulaExists.id || 'unknown',
          },
          'Ya existe un aula con ese nombre y pabellon',
        );

        throw new ConflictException(
          'Ya existe un aula con ese nombre y pabellon',
        );
      }

      const pabellonExists = await this.pabellonRepository.existsBy({
        id: pabellon_id,
      });

      if (!pabellonExists) {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'aula',
            reason: 'pabellon_not_found',
            pabellonId: pabellon_id || 'unknown',
          },
          'No existe un campus con ese id',
        );

        throw new NotFoundException('No existe un campus con ese id');
      }

      const aula = this.aulaRepository.create({
        codigo,
        nombre,
        pabellon: { id: pabellon_id },
      });

      this.logger.info(
        {
          operation: 'create_success',
          entity: 'aula',
          reason: 'create_success',
          aulaId: aula.id || 'unknown',
        },
        'Aula creada exitosamente',
      );

      return await this.aulaRepository.save(aula);
    } catch (error) {
      this.logger.error(
        {
          operation: 'create_error',
          entity: 'aula',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de creación de aula',
      );
      throw error;
    }
  }

  async findAll() {
    try {
      this.logger.info(
        {
          operation: 'find_all_started',
          entity: 'aula',
        },
        'Iniciando búsqueda de aulas',
      );
      
      const query = await this.aulaRepository.find({
        order: { nombre: 'ASC' },
      });

      this.logger.info(
        {
          operation: 'find_all_success',
          entity: 'aula',
        },
        'Aulas encontradas exitosamente',
      );

      return query;
    } catch (error) {
      this.logger.error(
        {
          operation: 'find_all_error',
          entity: 'aula',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de búsqueda de aulas',
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      this.logger.info(
        {
          operation: 'find_one_started',
          entity: 'aula',
          aulaId: id || 'unknown',
        },
        'Iniciando búsqueda de aula',
      );
      if (!id) {
        this.logger.error(
          {
            operation: 'find_one_failed',
            entity: 'aula',
            reason: 'aula_id_empty',
            aulaId: id || 'unknown',
          },
          'El ID del aula no puede estar vacío',
        );

        throw new BadRequestException('El ID del aula no puede estar vacío');
      }

      const aula = await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });

      if (!aula) {
        this.logger.error(
          {
            operation: 'find_one_failed',
            entity: 'aula',
            reason: 'aula_not_found',
            aulaId: id || 'unknown',
          },
          `Aula con id ${id} no encontrado`,
        );
        throw new NotFoundException(`Aula con id ${id} no encontrado`);
      }

      this.logger.info(
        {
          operation: 'find_one_success',
          entity: 'aula',
          aulaId: id || 'unknown',
        },
        'Aula encontrada exitosamente',
      );

      return aula;
    } catch (error) {
      this.logger.error(
        {
          operation: 'find_one_error',
          entity: 'aula',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de búsqueda de aula',
      );
      throw error;
    }
  }

  //TODO: agregar validaciones de campus_id, nombre si se envia uno o ambos parametros
  async update(id: string, updateAulaDto: UpdateAulaDto) {
    try {
      const { nombre, codigo, pabellon_id } = updateAulaDto;

      this.logger.info(
        {
          operation: 'update_started',
          entity: 'aula',
          aulaId: id || 'unknown',
        },
        'Iniciando actualización de aula',
      );

      if (!id) {
        this.logger.error(
          {
            operation: 'update_failed',
            entity: 'aula',
            reason: 'aula_id_empty',
            aulaId: id || 'unknown',
          },
          'El ID del aula no puede estar vacío',
        );

        throw new BadRequestException('El ID del aula no puede estar vacío');
      }

      const aula = await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });

      if (!aula) {
        this.logger.error(
          {
            operation: 'update_failed',
            entity: 'aula',
            reason: 'aula_not_found',
            aulaId: id || 'unknown',
          },
          `Aula con id ${id} no encontrado`,
        );

        throw new NotFoundException(`Aula con id ${id} no encontrado`);
      }

      const updateData: any = {};

      if (nombre !== undefined) {
        updateData.nombre = nombre;
      }

      if (codigo !== undefined) {
        const codigoExists = await this.aulaRepository.existsBy({
          id: Not(id),
          codigo,
        });

        if (codigoExists) {
          this.logger.error(
            {
              operation: 'update_failed',
              entity: 'aula',
              reason: 'aula_codigo_exists',
              aulaId: id || 'unknown',
            },
            'Ya existe un aula con ese codigo',
          );

          throw new ConflictException('Ya existe un aula con ese codigo');
        }
        updateData.codigo = codigo;
      }

      if (pabellon_id !== undefined) {
        const pabellonExists = await this.pabellonRepository.existsBy({
          id: pabellon_id,
        });

        if (!pabellonExists) {
          this.logger.error(
            {
              operation: 'update_failed',
              entity: 'aula',
              reason: 'pabellon_not_found',
              aulaId: id || 'unknown',
            },
            'No existe un campus con ese id',
          );

          throw new NotFoundException('No existe un campus con ese id');
        }
        updateData.pabellon = { id: pabellon_id };
      }

      if (Object.keys(updateData).length === 0) {
        return aula;
      }

      await this.aulaRepository.update(id, updateData);

      this.logger.info(
        {
          operation: 'update_success',
          entity: 'aula',
          aulaId: id || 'unknown',
        },
        'Aula actualizada exitosamente',
      );

      return await this.aulaRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(
        {
          operation: 'update_error',
          entity: 'aula',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de actualización de aula',
      );
      throw error;
    }
  }

  async remove(id: string) {
    try {
      this.logger.info(
        {
          operation: 'remove_started',
          entity: 'aula',
          aulaId: id || 'unknown',
        },
        'Iniciando eliminación de aula',
      );

      if (!id) {
        this.logger.error(
          {
            operation: 'remove_failed',
            entity: 'aula',
            reason: 'aula_id_empty',
            aulaId: id || 'unknown',
          },
          'El ID del aula no puede estar vacío',
        );

        throw new BadRequestException('El ID del aula no puede estar vacío');
      }

      const aula = await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });

      if (!aula) {
        this.logger.error(
          {
            operation: 'remove_failed',
            entity: 'aula',
            reason: 'aula_not_found',
            aulaId: id || 'unknown',
          },
          `Aula con id ${id} no encontrado`,
        );

        throw new NotFoundException(`Aula con id ${id} no encontrado`);
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
            operation: 'remove_failed',
            entity: 'aula',
            reason: 'aula_not_found',
            aulaId: id || 'unknown',
          },
          `Aula con id ${id} no encontrado`,
        );

        throw new NotFoundException('Aula no encontrado');
      }

      this.logger.info(
        {
          operation: 'remove_success',
          entity: 'aula',
          aulaId: id || 'unknown',
        },
        'Aula eliminada exitosamente',
      );

      return this.aulaRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(
        {
          operation: 'remove_error',
          entity: 'aula',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de eliminación de aula',
      );
      throw error;
    }
  }
}
