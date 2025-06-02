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
      if (!proveedorExists)
        throw new NotFoundException('No existe un proveedor con ese id');
      if (telefonoExists)
        throw new ConflictException('Ya existe un contacto con ese telefono');
      if (correoExists)
        throw new ConflictException('Ya existe un contacto con ese correo');

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
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
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

      if(search) {
        query.where('contacto.nombres LIKE :search OR contacto.apellidos LIKE :search', {
          search: `%${search}%`,
        });
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
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del contacto no puede estar vacío');

      const contacto = await this.contactoRepository.findOneBy({ id });
      if (!contacto) throw new NotFoundException('Contacto no encontrado');
      return contacto;
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

  async update(id: string, updateContactoDto: UpdateContactoDto) {
    try {
      const { nombres, apellidos, telefono, correo, proveedor_id } =
        updateContactoDto;

      if (!id) {
        throw new BadRequestException(
          'El ID del contacto no puede estar vacío',
        );
      }

      const contacto = await this.contactoRepository.findOneBy({ id });
      if (!contacto) {
        throw new NotFoundException('Contacto no encontrado');
      }

      const updateData: any = {};

      if (nombres !== undefined) {
        updateData.nombres = nombres;
      }
    } catch (error) {
      
    }
  }

  remove(id: number) {
    return `This action removes a #${id} contacto`;
  }
}
