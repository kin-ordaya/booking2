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

@Injectable()
export class ContactoService {
  constructor(
    @InjectRepository(Contacto)
    private readonly contactoRepository: Repository<Contacto>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  async create(createContactoDto: CreateContactoDto): Promise<Contacto> {
    try {
      const { nombres, apellidos, telefono, correo, proveedor_id } =
        createContactoDto;

      const [proveedorExists, telefonoExists, correoExists] = await Promise.all(
        [
          this.proveedorRepository.existsBy({ id: proveedor_id }),
          telefono ? this.contactoRepository.existsBy({ telefono }) : false,
          correo ? this.contactoRepository.existsBy({ correo }) : false,
        ],
      );

      if (!proveedorExists) {
        throw new NotFoundException(
          'No existe proveedor con ID ' + proveedor_id,
        );
      }

      if (telefonoExists) {
        throw new ConflictException(
          'Ya existe contacto con telefono ' + telefono,
        );
      }

      if (correoExists) {
        throw new ConflictException('Ya existe contacto con correo ' + correo);
      }

      const contacto = this.contactoRepository.create({
        nombres,
        apellidos,
        telefono,
        correo,
        proveedor: { id: proveedor_id },
      });

      return await this.contactoRepository.save(contacto);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear contacto');
    }
  }

  async findAll(paginationContactoDto: PaginationContactoDto) {
    try {
      const { page, limit, sort, search } = paginationContactoDto;

      const query = this.contactoRepository
        .createQueryBuilder('contacto')
        .addSelect('COUNT(*) OVER()', 'total_count');

      if (sort !== undefined) {
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

      if (search !== undefined && search.trim() !== '') {
        query.where(
          '(UPPER(contacto.nombres) LIKE UPPER(:search) OR UPPER(contacto.apellidos) LIKE UPPER(:search))',
          {
            search: `%${search}%`,
          },
        );
      }
      const results = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      const count =
        results.length > 0 ? parseInt(results[0].total_count, 10) : 0;

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
      throw new InternalServerErrorException('Error al recuperar contactos');
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de contacto vacío');
      }

      const contacto = await this.contactoRepository.findOne({
        where: { id },
        relations: ['proveedor'],
      });

      if (!contacto) {
        throw new NotFoundException(`Contacto con ID ${id} no encontrado`);
      }

      return contacto;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al recuperar contacto');
    }
  }

  async update(id: string, updateContactoDto: UpdateContactoDto) {
    try {
      if (!id) {
        throw new BadRequestException('ID de contacto vacío');
      }

      const { nombres, apellidos, telefono, correo, proveedor_id } =
        updateContactoDto;

      const contacto = await this.contactoRepository.findOne({
        where: { id },
        relations: ['proveedor'],
      });

      if (!contacto) {
        throw new NotFoundException(`Contacto con id ${id} no encontrado`);
      }

      const updateData: any = {};
      const validations: Promise<any>[] = [];

      if (telefono !== undefined && telefono !== contacto.telefono) {
        validations.push(
          this.contactoRepository
            .existsBy({
              id: Not(id),
              telefono,
            })
            .then((exists) => {
              if (exists) {
                throw new ConflictException(
                  'Ya existe un contacto con ese telefono ' + telefono,
                );
              }
              updateData.telefono = telefono;
            }),
        );
      }

      if (correo !== undefined && correo !== contacto.correo) {
        validations.push(
          this.contactoRepository
            .existsBy({
              id: Not(id),
              correo,
            })
            .then((exists) => {
              if (exists) {
                throw new ConflictException(
                  'Ya existe un contacto con ese correo ' + correo,
                );
              }
              updateData.correo = correo;
            }),
        );
      }

      if (
        proveedor_id !== undefined &&
        proveedor_id !== contacto.proveedor.id
      ) {
        validations.push(
          this.proveedorRepository
            .existsBy({
              id: proveedor_id,
            })
            .then((exists) => {
              if (!exists) {
                throw new NotFoundException(
                  'No existe un proveedor con id ' + proveedor_id,
                );
              }
              updateData.proveedor = { id: proveedor_id };
            }),
        );
      }

      if (validations.length > 0) {
        await Promise.all(validations);
      }

      if (nombres !== undefined && nombres !== contacto.nombres) {
        updateData.nombres = nombres;
      }

      if (apellidos !== undefined && apellidos !== contacto.apellidos) {
        updateData.apellidos = apellidos;
      }

      if (Object.keys(updateData).length === 0) {
        return contacto;
      }

      await this.contactoRepository.update(id, updateData);

      return await this.contactoRepository.findOne({
        where: { id },
        relations: ['proveedor'],
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar contacto');
    }
  }

  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID del contacto vacío');
      }

      const contactoExists = await this.contactoRepository.existsBy({ id });

      if (!contactoExists) {
        throw new NotFoundException(`Contacto con ID ${id} no encontrado`);
      }

      const result = await this.contactoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(
          `No se afectaron registros al cambiar estado`,
        );
      }

      return this.contactoRepository.findOne({
        where: { id },
        relations: ['proveedor'],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error en la deshabilitación/habilitación de contacto',
      );
    }
  }
}
