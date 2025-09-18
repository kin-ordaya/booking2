import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto) {
    try {
      const { nombre } = createRolDto;
      const exists = await this.rolRepository.existsBy({ nombre });
      if (exists)
        throw new ConflictException('Ya existe un rol con ese nombre');
      const rol = this.rolRepository.create({
        nombre,
      });

      return await this.rolRepository.save(rol);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.rolRepository.find({ order: { nombre: 'ASC' } });
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del rol no puede estar vacío');
      const rol = await this.rolRepository.findOneBy({ id });
      if (!rol) throw new NotFoundException('Rol no encontrado');
      return rol;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findOneByNombre(nombre: string) {
    try {
      console.log(nombre);
      if (!nombre)
        throw new BadRequestException(
          'El nombre del rol no puede estar vacío',
        );
      const rol = await this.rolRepository.findOne({ where: { nombre } });
      if (!rol) throw new NotFoundException('Rol no encontrado');
      return rol;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateRolDto: UpdateRolDto) {
    try {
      const { nombre } = updateRolDto;
      if (!id)
        throw new BadRequestException('El ID del rol no puede estar vacío');

      const rol = await this.rolRepository.findOneBy({ id });
      if (!rol) {
        throw new NotFoundException('Rol no encontrado');
      }
      const updateData: any = {};

      if (nombre !== undefined) {
        const nombreExists = await this.rolRepository.existsBy({
          id: Not(id),
          nombre,
        });

        if (nombreExists) {
          throw new ConflictException('Ya existe un rol con ese nombre');
        }
        updateData.nombre = nombre;
      }
      if (Object.keys(updateData).length === 0) {
        return rol;
      }

      await this.rolRepository.update(id, updateData);
      return await this.rolRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del rol no puede estar vacío');

      const result = await this.rolRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();
      if (result.affected === 0)
        throw new NotFoundException('Rol no encontrado');
      return this.rolRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
