import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFacultadDto } from './dto/create-facultad.dto';
import { UpdateFacultadDto } from './dto/update-facultad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Facultad } from './entities/facultad.entity';
import { Not, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginationFacultadDto } from './dto/pagination.dto';

@Injectable()
export class FacultadService {
  constructor(
    @InjectRepository(Facultad)
    private readonly facultadRepository: Repository<Facultad>,
  ) {}

  async create(createFacultadDto: CreateFacultadDto) {
    try {
      const { nombre } = createFacultadDto;

      const facultadExistente = await this.facultadRepository.findOne({
        where: { nombre: nombre },
      });

      if (facultadExistente) {
        throw new ConflictException('Ya existe un facultad con ese nombre');
      }

      const facultad = this.facultadRepository.create({
        nombre,
      });
      await this.facultadRepository.save(facultad);

      return facultad;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(paginationFacultadDto: PaginationFacultadDto) {
    try {
      const { page, limit, sort, search } = paginationFacultadDto;

      const query = this.facultadRepository.createQueryBuilder('facultad');

      if (sort) {
        switch (sort.toString()) {
          case '1':
            query.orderBy('facultad.nombre', 'ASC');
            break;
          case '2':
            query.orderBy('facultad.nombre', 'DESC');
            break;
          case '3':
            query.andWhere('facultad.estado = :estado', { estado: 1 });
            break;
          case '4':
            query.andWhere('facultad.estado = :estado', { estado: 0 });
            break;
        }
      }

      if (search) {
        query.where('facultad.nombre LIKE :search', {
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
      console.log(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.facultadRepository.findOne({
        where: { id: id },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: string, updateFacultadDto: UpdateFacultadDto) {
    try {
      const { nombre } = updateFacultadDto;
      const facultad = await this.facultadRepository.findOne({
        where: { id: id },
        select: ['id'],
      });
      if (!facultad) {
        throw new NotFoundException('No existe un facultad con ese id');
      }
      if (nombre) {
        const nombreExistente = await this.facultadRepository.findOne({
          where: { id: Not(id), nombre: nombre },
          select: ['id'],
        });
        if (nombreExistente) {
          throw new ConflictException('Ya existe un facultad con ese nombre');
        }
      }
      const facultadActualizado = await this.facultadRepository.update(id, {
        ...updateFacultadDto,
      });

      if (facultadActualizado.affected === 0) {
        throw new InternalServerErrorException(
          'No se pudo actualizar el facultad',
        );
      }
      const facultadActualizadoFinal = await this.facultadRepository.findOne({
        where: { id: id },
      });
      return facultadActualizadoFinal;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const facultad = await this.facultadRepository.findOne({
        where: { id: id },
        select: ['id', 'estado'],
      });
      if (!facultad) {
        throw new NotFoundException('No existe un facultad con ese id');
      }

      const nuevoEstado = facultad.estado === 1 ? 0 : 1;

      const facultadEliminado = await this.facultadRepository.update(id, {
        estado: nuevoEstado,
      });

      if (facultadEliminado.affected === 0) {
        throw new InternalServerErrorException(
          'No se pudo eliminar el facultad',
        );
      }
      const facultadEliminadoFinal = await this.facultadRepository.findOne({
        where: { id: id },
        select: ['id', 'estado'],
      });

      return facultadEliminadoFinal;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
