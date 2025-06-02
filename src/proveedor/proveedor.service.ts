import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  async create(createProveedorDto: CreateProveedorDto) {
    try {
      const { ruc } = createProveedorDto;

      if (ruc !== undefined) {
        if (await this.proveedorRepository.existsBy({ ruc })) {
          throw new ConflictException('Ya existe un proveedor con ese RUC');
        }
      }

      const proveedor = this.proveedorRepository.create({
        ...createProveedorDto,
      });
      return await this.proveedorRepository.save(proveedor);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.proveedorRepository.find({
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
          'El ID del proveedor no puede estar vacío',
        );

      const proveedor = await this.proveedorRepository.findOneBy({ id });
      if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

      return proveedor;
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

  async update(id: string, updateProveedorDto: UpdateProveedorDto) {
    try {
      const { ruc, nombre, pais, telefono, correo, descripcion } =
        updateProveedorDto;
      if (!id) {
        throw new BadRequestException(
          'El ID del proveedor no puede estar vacío',
        );
      }

      const proveedor = await this.proveedorRepository.findOneBy({ id });
      if (!proveedor) {
        throw new NotFoundException('Proveedor no encontrado');
      }

      const updateData: any = {};

      if (ruc !== undefined) {
        const rucExists = await this.proveedorRepository.existsBy({
          id: Not(id),
          ruc,
        });
        if (rucExists) {
          throw new ConflictException('Ya existe un proveedor con ese RUC');
        }
        updateData.ruc = ruc;
      }
      if (nombre !== undefined) updateData.nombre = nombre;
      if (pais !== undefined) updateData.pais = pais;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (correo !== undefined) updateData.correo = correo;
      if (descripcion !== undefined) updateData.descripcion = descripcion;

      if (Object.keys(updateData).length === 0) {
        return proveedor;
      }

      await this.proveedorRepository.update(id, updateData);
      return await this.proveedorRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} proveedor`;
  }
}
