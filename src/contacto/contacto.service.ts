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

@Injectable()
export class ContactoService {
  constructor(
    @InjectPinoLogger(ContactoService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(Contacto)
    private readonly contactoRepository: Repository<Contacto>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  async create(createContactoDto: CreateContactoDto): Promise<Contacto> {
    try {
      const { nombres, apellidos, telefono, correo, proveedor_id } =
        createContactoDto;

      this.logger.info(
        {
          operation: 'create_started',
          entity: 'contacto',
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
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'contacto',
            reason: 'proveedor_not_found',
          },
          'No existe un proveedor con ese id',
        );

        throw new NotFoundException('No existe un proveedor con ese id');
      }

      if (telefonoExists) {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'contacto',
            reason: 'contacto_exists',
          },
          'Ya existe un contacto con ese telefono',
        );

        throw new ConflictException('Ya existe un contacto con ese telefono');
      }

      if (correoExists) {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'contacto',
            reason: 'contacto_exists',
          },
          'Ya existe un contacto con ese correo',
        );

        throw new ConflictException('Ya existe un contacto con ese correo');
      }

      const contacto = this.contactoRepository.create({
        nombres,
        apellidos,
        telefono,
        correo,
        proveedor: { id: proveedor_id },
      });

      this.logger.info(
        {
          operation: 'create_success',
          entity: 'contacto',
          reason: 'create_success',
          contactoId: contacto.id || 'unknown',
        },
        'Contacto creado exitosamente',
      );

      return await this.contactoRepository.save(contacto);
    } catch (error) {
      this.logger.error(
        {
          operation: 'create_error',
          entity: 'contacto',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de creación de contacto',
      );
      throw error;
    }
  }

  async findAll(paginationContactoDto: PaginationContactoDto) {
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
          operation: 'find_all_error',
          entity: 'contacto',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de búsqueda de contactos',
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        this.logger.error(
          {
            operation: 'find_one_failed',
            entity: 'contacto',
            reason: 'contacto_id_empty',
            contactoId: id || 'unknown',
          },
          'El ID del contacto no puede estar vacío',
        );

        throw new BadRequestException(
          'El ID del contacto no puede estar vacío',
        );
      }

      const contacto = await this.contactoRepository.findOneBy({ id });

      if (!contacto) {
        this.logger.error(
          {
            operation: 'find_one_failed',
            entity: 'contacto',
            reason: 'contacto_not_found',
            contactoId: id || 'unknown',
          },
          `Contacto con id ${id} no encontrado`,
        );

        throw new NotFoundException('Contacto no encontrado');
      }

      this.logger.info(
        {
          operation: 'find_one_success',
          entity: 'contacto',
          contactoId: id || 'unknown',
        },
        'Contacto encontrado exitosamente',
      );

      return contacto;
    } catch (error) {
      this.logger.error(
        {
          operation: 'find_one_error',
          entity: 'contacto',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de búsqueda de contacto',
      );
      throw error;
    }
  }

  async update(id: string, updateContactoDto: UpdateContactoDto) {
    try {
      const { nombres, apellidos, telefono, correo, proveedor_id } =
        updateContactoDto;

      this.logger.info(
        {
          operation: 'update_started',
          entity: 'contacto',
          contactoId: id || 'unknown',
        },
        'Iniciando actualización de contacto',
      );

      if (!id) {
        this.logger.error(
          {
            operation: 'update_failed',
            entity: 'contacto',
            reason: 'contacto_id_empty',
            contactoId: id || 'unknown',
          },
          'El ID del contacto no puede estar vacío',
        );

        throw new BadRequestException(
          'El ID del contacto no puede estar vacío',
        );
      }

      const contacto = await this.contactoRepository.findOneBy({ id });

      if (!contacto) {
        this.logger.error(
          {
            operation: 'update_failed',
            entity: 'contacto',
            reason: 'contacto_not_found',
            contactoId: id || 'unknown',
          },
          `Contacto con id ${id} no encontrado`,
        );
          
        throw new NotFoundException('Contacto no encontrado');
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
          this.logger.error(
            {
              operation: 'update_failed',
              entity: 'contacto',
              reason: 'contacto_exists',
              contactoId: id || 'unknown',
            },
            'Ya existe un contacto con ese telefono',
          );

          throw new ConflictException('Ya existe un contacto con ese telefono');
        }

        updateData.telefono = telefono;
      }
      if (correo !== undefined) {
        const correoExists = await this.contactoRepository.existsBy({
          id: Not(id),
          correo,
        });

        if (correoExists) {
          this.logger.error(
            {
              operation: 'update_failed',
              entity: 'contacto',
              reason: 'contacto_exists',
              contactoId: id || 'unknown',
            },
            'Ya existe un contacto con ese correo',
          );

          throw new ConflictException('Ya existe un contacto con ese correo');
        }
        updateData.correo = correo;
      }

      if (proveedor_id !== undefined) {
        const proveedorExists = await this.proveedorRepository.existsBy({
          id: proveedor_id,
        });

        if (!proveedorExists) {
          this.logger.error(
            {
              operation: 'update_failed',
              entity: 'contacto',
              reason: 'proveedor_not_found',
              contactoId: id || 'unknown',
            },
            'No existe un proveedor con ese id',
          );

          throw new NotFoundException('No existe un proveedor con ese id');
        }

        updateData.proveedor = { id: proveedor_id };
      }

      if (Object.keys(updateData).length === 0) {
        return contacto;
      }

      await this.contactoRepository.update(id, updateData);
      
      this.logger.info(
        {
          operation: 'update_success',
          entity: 'contacto',
          reason: 'update_success',
          contactoId: id || 'unknown',
        },
        'Contacto actualizado exitosamente',
      );

      return await this.contactoRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(
        {
          operation: 'update_error',
          entity: 'contacto',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de actualización de contacto',
      );
      throw error;
    }
  }

  async remove(id: string) {
    try {
      this.logger.info(
        {
          operation: 'remove_started',
          entity: 'contacto',
          contactoId: id || 'unknown',
        },
        'Iniciando eliminación de contacto',
      );

      if (!id){
        this.logger.error(
          {
            operation: 'remove_failed',
            entity: 'contacto',
            reason: 'contacto_id_empty',
            contactoId: id || 'unknown',
          },
          'El ID del contacto no puede estar vacío',
        );

        throw new BadRequestException(
          'El ID del contacto no puede estar vacío',
        );}

      const result = await this.contactoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0){
        this.logger.error(
          {
            operation: 'remove_failed',
            entity: 'contacto',
            reason: 'contacto_not_found',
            contactoId: id || 'unknown',
          },
          `Contacto con id ${id} no encontrado`,
        );
        throw new NotFoundException('Contacto no encontrado');
      }

      this.logger.info(
        {
          operation: 'remove_success',
          entity: 'contacto',
          contactoId: id || 'unknown',
        },
        'Contacto eliminado exitosamente',
      );

      return this.contactoRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(
        {
          operation: 'remove_error',
          entity: 'contacto',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de eliminación de contacto',
      );
      throw error
    }
  }
}
