import { PaginationCredencialDto } from './dto/pagination-credencial.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCredencialDto } from './dto/create-credencial.dto';
import { UpdateCredencialDto } from './dto/update-credencial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Credencial } from './entities/credencial.entity';
import { Repository } from 'typeorm';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CredencialService {
  constructor(
    private readonly config: ConfigService,

    @InjectPinoLogger(CredencialService.name)
    private readonly logger: PinoLogger,

    @InjectRepository(Credencial)
    private readonly credencialRepository: Repository<Credencial>,

    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createCredencialDto: CreateCredencialDto) {
    const operation = 'create_credencial';
    const startTime = Date.now();

    try {
      const { usuario, clave, recurso_id, rol_id } = createCredencialDto;

      this.logger.info(
        {
          operation,
          entity: 'credencial',
          phase: 'start',
          reason: 'create_started',
          usuario,
          clave,
          recurso_id,
          rol_id,
        },
        'Iniciando creación de credencial',
      );

      const [recursoExists, rolExists] = await Promise.all([
        this.recursoRepository.findOne({
          where: { id: recurso_id },
          relations: ['tipoAcceso'],
        }),
        this.rolRepository.existsBy({ id: rol_id }),
      ]);

      if (!recursoExists) {
        this.logger.warn(
          {
            operation,
            entity: 'credencial',
            phase: 'validation_failed',
            reason: 'recurso_not_found',
            recurso_id,
          },
          'No existe un recurso con id ' + recurso_id,
        );

        throw new NotFoundException(
          'No existe un recurso con id ' + recurso_id,
        );
      }

      if (!rolExists) {
        this.logger.warn(
          {
            operation,
            entity: 'credencial',
            phase: 'validation_failed',
            reason: 'rol_not_found',
            rol_id,
          },
          'No existe un rol con id ' + rol_id,
        );

        throw new NotFoundException('No existe un rol con id ' + rol_id);
      }

      const tipoAcceso = recursoExists.tipoAcceso.nombre;

      // Validación según tipo de acceso
      if (tipoAcceso === 'USERPASS') {
        if (!usuario || !clave) {
          this.logger.warn(
            {
              operation,
              entity: 'credencial',
              phase: 'validation_failed',
              reason: 'usuario_clave_empty',
            },
            'Campos usuario y clave vacíos',
          );

          throw new BadRequestException('Campos usuario y clave vacíos');
        }
        const credencialExists = await this.credencialRepository.findOne({
          where: { usuario, clave, recurso: { id: recurso_id } },
        });

        if (credencialExists) {
          this.logger.warn(
            {
              operation,
              entity: 'credencial',
              phase: 'validation_failed',
              reason: 'credencial_exists',
              usuario,
              clave,
            },
            'Ya existe una credencial con usuario y clave ' +
              usuario +
              ' y ' +
              clave +
              ' en el recurso ' +
              recurso_id,
          );

          throw new ConflictException(
            'Ya existe una credencial con usuario y clave ' +
              usuario +
              ' y ' +
              clave +
              ' en el recurso ' +
              recurso_id,
          );
        }
      } else if (tipoAcceso === 'KEY') {
        if (!clave) {
          this.logger.warn(
            {
              operation,
              entity: 'credencial',
              phase: 'validation_failed',
              reason: 'clave_empty',
            },
            'Campo clave vacío',
          );

          throw new BadRequestException('Campo clave vacío');
        }
        const credencialExists = await this.credencialRepository.findOne({
          where: { clave, recurso: { id: recurso_id } },
        });

        if (credencialExists) {
          this.logger.warn(
            {
              operation,
              entity: 'credencial',
              phase: 'validation_failed',
              reason: 'credencial_exists',
              clave,
            },
            'Ya existe una credencial con clave ' +
              clave +
              ' en el recurso ' +
              recurso_id,
          );

          throw new ConflictException(
            'Ya existe una credencial con clave ' +
              clave +
              ' en el recurso ' +
              recurso_id,
          );
        }
      } else {
        this.logger.warn(
          {
            operation,
            entity: 'credencial',
            phase: 'validation_failed',
            reason: 'tipo_acceso_invalid',
            tipoAcceso,
          },
          'Tipo de acceso no válido ' + tipoAcceso,
        );

        throw new BadRequestException('Tipo de acceso no válido ' + tipoAcceso);
      }

      // // Construcción dinámica del objeto
      // const credencialData: Credencial = {
      //   clave,
      //   recurso: { id: recurso_id },
      //   rol: { id: rol_id },
      // };

      // // Solo agregamos 'usuario' si es USERPASS
      // if (tipoAcceso === 'USERPASS') {
      //   credencialData.usuario = usuario;
      // }

      const credencial = this.credencialRepository.create({
        usuario,
        clave,
        recurso: { id: recurso_id },
        rol: { id: rol_id },
      });

      const savedCredencial = await this.credencialRepository.save(credencial);
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'credencial',
          phase: 'success',
          reason: 'create_success',
          usuario,
          clave,
          recurso_id: savedCredencial.recurso.id,
          rol_id: savedCredencial.rol.id,
          credencial_id: savedCredencial.id,
          duration,
        },
        'Credencial creada exitosamente',
      );

      return savedCredencial;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          operation: 'create_error',
          entity: 'credencial',
          error_type: error.constructor.name,
          error_message: error.message,
          stack_trace:
            this.config.get('NODE_ENV') === 'development'
              ? error.stack
              : undefined,
          duration,
          timestamp: new Date().toISOString(),
        },
        'Error en proceso de creación de credencial',
      );
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll(paginationCredencialDto: PaginationCredencialDto) {
    const operation = 'find_all_started';
    try {
      const { page, limit, search, recurso_id, sort_state, rol_id } =
        paginationCredencialDto;

      const recursoExists = await this.recursoRepository.existsBy({
        id: recurso_id,
      });

      if (!recursoExists) {
        this.logger.warn(
          {
            operation,
            entity: 'credencial',
            phase: 'validation_failed',
            reason: 'not_found',
            recursoId: recurso_id,
          },
          'No existe un recurso con id ' + recurso_id,
        );

        throw new NotFoundException(
          'No existe un recurso con ese id ' + recurso_id,
        );
      }

      const query = this.credencialRepository
        .createQueryBuilder('credencial')
        .leftJoinAndSelect('credencial.recurso', 'recurso')
        .leftJoinAndSelect('credencial.rol', 'rol')
        .select([
          'credencial.id',
          'credencial.usuario',
          'credencial.creacion',
          'credencial.clave',
          'credencial.estado',
          'recurso.nombre',
          'recurso.capacidad',
          'rol.nombre',
        ])
        .where('credencial.recurso.id = :recurso_id', { recurso_id });

      let orderApplied = false;
      if (sort_state !== undefined) {
        query.andWhere('credencial.estado = :estado', {
          estado: sort_state === 1 ? 1 : 0,
        });
        orderApplied = true;
      }

      if (!orderApplied) {
        query.orderBy('credencial.creacion', 'DESC');
      }

      if (rol_id !== undefined) {
        query.andWhere('rol.id = :rol_id', {
          rol_id,
        });
      }

      if (search) {
        // Cambiar .where() por .andWhere() aquí
        query.andWhere(
          '(UPPER(credencial.usuario) LIKE UPPER(:search) OR UPPER(credencial.clave) LIKE UPPER(:search))',
          { search: `%${search}%` },
        );
      }

      const [results, count] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      this.logger.debug(
        {
          operation,
          entity: 'credencial',
          count: count,
        },
        'Credencials recuperadas exitosamente',
      );

      return {
        results,
        meta: {
          count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'credencial',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        'Error al recuperar credencials',
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findOne(id: string) {
    const operation = 'find_one_started';
    try {
      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'credencial',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID de la credencial vacío',
        );

        throw new BadRequestException('ID de la credencial vacío');
      }

      const credencial = await this.credencialRepository.findOne({
        where: { id },
        relations: ['rol'],
      });

      if (!credencial) {
        this.logger.warn(
          {
            operation,
            entity: 'credencial',
            phase: 'validation_failed',
            reason: 'not_found',
            credencialId: id,
          },
          `Credencial con id ${id} no encontrada`,
        );
        throw new NotFoundException(`Credencial con id ${id} no encontrada`);
      }

      this.logger.debug(
        {
          operation,
          entity: 'credencial',
          credencialId: id,
        },
        'Credencial recuperada exitosamente',
      );

      return credencial;
    } catch (error) {
      this.logger.error(
        {
          operation: 'find_one_error',
          entity: 'credencial',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        'Error al recuperar credencial ' + id,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateCredencialDto: UpdateCredencialDto) {
    const operation = 'update_started';
    const startTime = Date.now();
    try {
      const { usuario, clave, rol_id } = updateCredencialDto;

      this.logger.info(
        {
          operation,
          entity: 'credencial',
          phase: 'start',
          reason: 'update_started',
          credencial_id: id,
          update_fields: Object.keys(updateCredencialDto).filter(
            (key) => updateCredencialDto[key] !== undefined,
          ),
        },
        'Iniciando actualización de credencial',
      );

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'credencial',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID de la credencial vacío',
        );

        throw new BadRequestException('ID de la credencial vacío');
      }

      // Obtener la credencial con relaciones necesarias
      const credencial = await this.credencialRepository.findOne({
        where: { id },
        relations: ['recurso', 'recurso.tipoAcceso'],
      });

      if (!credencial) {
        this.logger.warn(
          {
            operation,
            entity: 'credencial',
            phase: 'validation_failed',
            reason: 'not_found',
            credencial_id: id,
          },
          'Credencial no encontrada ' + id,
        );

        throw new NotFoundException('Credencial no encontrada ' + id);
      }

      const tipoAcceso = credencial.recurso.tipoAcceso.nombre;

      if (tipoAcceso === 'KEY') {
        if (usuario !== undefined) {
          delete updateCredencialDto.usuario;
        }
      }

      // Preparar datos para actualizar
      const updateData: any = {};

      if (usuario !== undefined && tipoAcceso === 'USERPASS') {
        updateData.usuario = usuario;
      }

      if (clave !== undefined) {
        updateData.clave = clave;
      }

      if (rol_id !== undefined) {
        const rolExists = await this.rolRepository.existsBy({
          id: rol_id,
        });

        if (!rolExists) {
          this.logger.warn(
            {
              operation,
              entity: 'credencial',
              phase: 'validation_failed',
              reason: 'rol_not_found',
              rol_id: rol_id,
            },
            'No existe un rol con ese id ' + rol_id,
          );

          throw new NotFoundException('No existe un rol con ese id ' + rol_id);
        }

        updateData.rol = { id: rol_id };
      }

      // Si no hay cambios, retornar la credencial actual
      if (Object.keys(updateData).length === 0) {
        this.logger.debug(
          {
            operation,
            entity: 'credencial',
            credencial_id: id,
            phase: 'validation_failed',
            reason: 'no_changes',
          },
          'No hay cambios para actualizar',
        );
        return credencial;
      }

      // Aplicar actualización
      await this.credencialRepository.update(id, updateData);
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'credencial',
          phase: 'success',
          credencial_id: id,
          updated_fields: Object.keys(updateData),
          duration,
        },
        'Credencial actualizada exitosamente',
      );

      return await this.credencialRepository.findOne({
        where: { id },
        relations: ['recurso', 'rol'],
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          operation,
          entity: 'credencial',
          credencial_id: id,
          phase: 'error',
          error: 'update_error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        'Error actualizando credencial ' + id + ': ' + error.message,
      );
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    const operation = 'remove_started';
    const startTime = Date.now();

    try {
      this.logger.warn({
        operation,
        entity: 'credencial',
        phase: 'start',
        reason: 'remove_started',
        credencial_id: id,
      });

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'credencial',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'ID de la credencial vacío',
        );
        throw new BadRequestException(
          'El ID de la credencial no puede estar vacío',
        );
      }

      const credencial = await this.credencialRepository.findOne({
        where: { id },
        relations: ['recurso', 'recurso.tipoAcceso'],
      });

      if (!credencial) {
        this.logger.warn(
          {
            operation,
            entity: 'credencial',
            phase: 'validation_failed',
            reason: 'not_found',
            credencial_id: id,
          },
          `Credencial con id ${id} no encontrada`,
        );
        throw new NotFoundException(`Credencial con id ${id} no encontrada`);
      }

      const result = await this.credencialRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        this.logger.info(
          {
            operation,
            entity: 'credencial',
            reason: 'no_affected',
            credencial_id: id,
          },
          `No se afectaron registros al cambiar estado`,
        );
        throw new NotFoundException('Credencial no encontrada');
      }

      const duration = Date.now() - startTime;

      this.logger.warn(
        {
          operation,
          entity: 'credencial',
          phase: 'success',
          credencial_id: id,
          previous_estado: credencial.estado,
          action: credencial.estado === 1 ? 'desactivada' : 'reactivada',
          duration,
        },
        `Credencial ${credencial.estado === 1 ? 'desactivada' : 'reactivada'} exitosamente`,
      );

      return this.credencialRepository.findOneBy({ id });
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'credencial',
          credencial_id: id,
          phase: 'error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        `Error eliminando credencial ${id}: ${error.message}`,
      );
      if(
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ){
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
