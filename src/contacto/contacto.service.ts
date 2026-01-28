import { PaginationContactoDto } from './dto/pagination-contacto.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contacto } from './entities/contacto.entity';
import { Not, Repository } from 'typeorm';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactoService {
  constructor(
    @InjectPinoLogger(ContactoService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(Contacto)
    private readonly contactoRepository: Repository<Contacto>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    private readonly config: ConfigService,
  ) {}

  async create(createContactoDto: CreateContactoDto): Promise<Contacto> {
    const operation = 'create_contacto';
    const startTime = Date.now();
    try {
      const { nombres, apellidos, telefono, correo, proveedor_id } =
        createContactoDto;

      this.logger.info(
        {
          operation,
          entity: 'contacto',
          phase: 'start',
          reason: 'create_started',
          nombres,
          apellidos,
          telefono,
          correo,
          proveedor_id,
        },
        'Iniciando creación de contacto',
      );

      const [proveedorExists, telefonoExists, correoExists] = await Promise.all(
        [
          this.proveedorRepository.existsBy({ id: proveedor_id }),
          telefono ? this.contactoRepository.existsBy({ telefono }) : false,
          correo ? this.contactoRepository.existsBy({ correo }) : false,
        ],
      );

      if (!proveedorExists) {
        this.logger.warn(
          {
            operation,
            entity: 'contacto',
            phase: 'validation_failed',
            reason: 'proveedor_not_found',
            proveedor_id,
          },
          'No existe un proveedor con ese id ' + proveedor_id,
        );

        throw new NotFoundException('No existe un proveedor con ese id ' + proveedor_id);
      }

      if (telefonoExists) {
        this.logger.warn(
          {
            operation,
            entity: 'contacto',
            phase: 'validation_failed',
            reason: 'contacto_exists',
          },
          'Ya existe un contacto con ese telefono ' + telefono,
        );

        throw new ConflictException('Ya existe un contacto con ese telefono ' + telefono);
      }

      if (correoExists) {
        this.logger.warn(
          {
            operation,
            entity: 'contacto',
            phase: 'validation_failed',
            reason: 'contacto_exists',
          },
          'Ya existe un contacto con ese correo ' + correo,
        );

        throw new ConflictException('Ya existe un contacto con ese correo ' + correo);
      }

      const contacto = this.contactoRepository.create({
        nombres,
        apellidos,
        telefono,
        correo,
        proveedor: { id: proveedor_id },
      });

      const savedContacto = await this.contactoRepository.save(contacto);
      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'contacto',
          phase: 'success',
          reason: 'create_success',
          contacto_id: savedContacto.id,
          nombres,
          apellidos,
          telefono,
          correo,
          proveedor_id,
          duration
        },
        'Contacto creado exitosamente',
      );

      return savedContacto;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          operation,
          entity: 'contacto',
          phase: 'error',
          error_type: error.constructor.name,
          error_message: error.message,
          stack_trace:
            this.config.get('NODE_ENV') === 'development' ? error.stack : undefined,
          duration,
          timestamp: new Date().toISOString(),
        },
        'Error en proceso de creación de contacto',
      );
      if(error instanceof ConflictException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear contacto');
    }
  }

  async findAll(paginationContactoDto: PaginationContactoDto) {
    const operation = 'find_all_contactos';
    try {
      const { page, limit, sort, search } = paginationContactoDto;

      const query = this.contactoRepository.createQueryBuilder('contacto');

      if (sort) {
        switch (sort.toString()) {
          case '1':
            query.orderBy('contacto.nombres', 'ASC');
            break;
          case '2':
            query.orderBy('contacto.nombres', 'DESC');
            break;
          case '3':
            query.andWhere('contacto.estado = :estado', { estado: 1 });
            break;
          case '4':
            query.andWhere('contacto.estado = :estado', { estado: 0 });
            break;
        }
      }

      if (search) {
        query.where(
          '(UPPER(contacto.nombres) LIKE UPPER(:search) OR UPPER(contacto.apellidos) LIKE UPPER(:search))',
          {
            search: `%${search}%`,
          },
        );
      }
      const [results, count] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();


        this.logger.debug(
          {
            operation,
            entity: 'contacto',
            count: count,
          },
          'Contactos encontrados exitosamente',
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
          entity: 'contacto',
          error_type: error.constructor.name,
          error_message: error.message,
        },
        'Error en proceso de búsqueda de contactos',
      );

      throw new InternalServerErrorException('Error al recuperar contactos');
    }
  }

  async findOne(id: string) {
    const operation = 'find_one_contacto';
    try {
      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'contacto',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'El ID del contacto vacío',
        );

        throw new BadRequestException(
          'El ID del contacto vacío',
        );
      }

      const contacto = await this.contactoRepository.findOneBy({ id });

      if (!contacto) {
        this.logger.warn(
          {
            operation,
            entity: 'contacto',
            phase: 'validation_failed',
            reason: 'contacto_not_found',
            contacto_id: id,
          },
          `Contacto con id ${id} no encontrado`,
        );

        throw new NotFoundException('Contacto no encontrado');
      }

      this.logger.debug(
        {
          operation,
          entity: 'contacto',
          contacto_id: id,
        },
        'Contacto encontrado exitosamente',
      );

      return contacto;
    } catch (error) {
      this.logger.error(
        {
          operation,
          entity: 'contacto',
          contacto_id: id,
          error_type: error.constructor.name,
          error_message: error.message,
        },
        'Error al recuperar contacto ' + id,
      );
      if(error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al recuperar contacto');
    }
  }

  async update(id: string, updateContactoDto: UpdateContactoDto) {
    const operation = 'update_contacto';
    const startTime = Date.now();

    try {
      const { nombres, apellidos, telefono, correo, proveedor_id } =
        updateContactoDto;

      this.logger.info(
        {
          operation,
          entity: 'contacto',
          phase: 'start',
          reason: 'update_started',
          contacto_id: id,
          update_fields: Object.keys(updateContactoDto).filter(
            (key) => updateContactoDto[key] !== undefined,
          ),
        },
        'Iniciando actualización de contacto',
      );

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'contacto',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'El ID del contacto vacío',
        );

        throw new BadRequestException(
          'El ID del contacto vacío',
        );
      }

      const contacto = await this.contactoRepository.findOneBy({ id });

      if (!contacto) {
        this.logger.warn(
          {
            operation,
            entity: 'contacto',
            phase: 'validation_failed',
            reason: 'not_found',
            contacto_id: id,
          },
          `Contacto con id ${id} no encontrado`,
        );

        throw new NotFoundException(`Contacto con id ${id} no encontrado`);
      }

      const updateData: any = {};

      if (nombres !== undefined) {
        updateData.nombres = nombres;
      }
      if (apellidos !== undefined) {
        updateData.apellidos = apellidos;
      }
      if (telefono !== undefined) {
        const telefonoExists = await this.contactoRepository.existsBy({
          id: Not(id),
          telefono,
        });

        if (telefonoExists) {
          this.logger.warn(
            {
              operation,
              entity: 'contacto',
              phase: 'validation_failed',
              reason: 'duplicate_telefono',
              contacto_id: id,
              telefono,
            },
            'Ya existe un contacto con ese telefono ' + telefono,
          );

          throw new ConflictException('Ya existe un contacto con ese telefono ' + telefono);
        }

        updateData.telefono = telefono;
      }
      if (correo !== undefined) {
        const correoExists = await this.contactoRepository.existsBy({
          id: Not(id),
          correo,
        });

        if (correoExists) {
          this.logger.warn(
            {
              operation,
              entity: 'contacto',
              phase: 'validation_failed',
              reason: 'duplicate_correo',
              contacto_id: id,
              correo,
            },
            'Ya existe un contacto con ese correo ' + correo,
          );

          throw new ConflictException('Ya existe un contacto con ese correo ' + correo);
        }
        updateData.correo = correo;
      }

      if (proveedor_id !== undefined) {
        const proveedorExists = await this.proveedorRepository.existsBy({
          id: proveedor_id,
        });

        if (!proveedorExists) {
          this.logger.warn(
            {
              operation,
              entity: 'contacto',
              phase: 'validation_failed',
              reason: 'proveedor_not_found',
              contacto_id: id,
            },
            'No existe un proveedor con id ' + proveedor_id,
          );

          throw new NotFoundException('No existe un proveedor con id ' + proveedor_id);
        }

        updateData.proveedor = { id: proveedor_id };
      }

      if (Object.keys(updateData).length === 0) {
        return contacto;
      }

      await this.contactoRepository.update(id, updateData);
      const duration = Date.now() - startTime;
      this.logger.info(
        {
          operation,
          entity: 'contacto',
          phase: 'success',
          reason: 'update_success',
          contacto_id: id,
          updated_fields: Object.keys(updateData),
          duration,
        },
        'Contacto actualizado exitosamente',
      );

      return await this.contactoRepository.findOneBy({ id });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          operation,
          entity: 'contacto',
          contacto_id: id,
          phase: 'error',
          reason: 'update_error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        `Error actualizando contacto ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async remove(id: string) {
    const operation = 'remove_contacto';
    const startTime = Date.now();

    try {
      this.logger.warn(
        {
          operation,
          entity: 'contacto',
          phase: 'start',
          reason: 'remove_started',
          contacto_id: id,
        },
        'Iniciando eliminación de contacto',
      );

      if (!id) {
        this.logger.warn(
          {
            operation,
            entity: 'contacto',
            phase: 'validation_failed',
            reason: 'empty_id',
          },
          'El ID del contacto vacío',
        );

        throw new BadRequestException(
          'El ID del contacto vacío',
        );
      }

      const result = await this.contactoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        this.logger.error(
          {
            operation,
            entity: 'contacto',
            phase: 'no_affected',
            reason: 'contacto_not_found',
            contacto_id: id,
          },
          `Contacto con id ${id} no encontrado`,
        );
        throw new NotFoundException(`Contacto con id ${id} no encontrado`);
      }
      const duration = Date.now() - startTime;

      this.logger.warn(
        {
          operation,
          entity: 'contacto',
          phase: 'success',
          reason: 'remove_success',
          contacto_id: id,
          duration,
        },
        `Contacto eliminado exitosamente ${id}`,
      );

      return this.contactoRepository.findOneBy({ id });
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        {
          operation,
          entity: 'contacto',
          contacto_id: id,
          phase: 'error',
          reason: 'remove_error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
         `Error eliminando contacto ${id}: ${error.message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar contacto');
    }
  }
}
