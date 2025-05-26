import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { Not, Repository } from 'typeorm';
import { PaginationCursoDto } from './dto/pagination.dto';
import { Eap } from 'src/eap/entities/eap.entity';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(Eap)
    private readonly eapRepository: Repository<Eap>,
  ) {}

  async create(createCursoDto: CreateCursoDto) {
    const { codigo, nombre, descripcion, eap_id } = createCursoDto;
    try {
      // Validar si el codigo ya existe
      const cursoExistente = await this.cursoRepository.findOne({
        where: { codigo: codigo },
      });

      if (cursoExistente) {
        throw new ConflictException('Ya existe un curso con ese codigo');
      }

      const eap = await this.eapRepository.findOne({
        where: { id: eap_id },
        select: ['id'],
      });
      if (!eap) {
        throw new NotFoundException('No existe un eap con ese id');
      }

      const curso = this.cursoRepository.create({
        codigo,
        nombre,
        descripcion,
        eap: { id: eap_id },
      });
      await this.cursoRepository.save(curso);

      return curso;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(paginationCursoDto: PaginationCursoDto) {
    try {
      const { page, limit, sort, search } = paginationCursoDto;

      const query = this.cursoRepository.createQueryBuilder('curso');

      if (sort) {
        switch (sort.toString()) {
          case '1':
            query.orderBy('curso.nombre', 'ASC');
            break;
          case '2':
            query.orderBy('curso.nombre', 'DESC');
            break;
          case '3':
            query.andWhere('curso.estado = :estado', { estado: 1 });
            break;
          case '4':
            query.andWhere('curso.estado = :estado', { estado: 0 });
            break;
        }
      }

      if (search) {
        query.where('curso.codigo LIKE :search OR curso.nombre LIKE :search', {
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
      return await this.cursoRepository.findOne({
        where: { id: id },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: string, updateCursoDto: UpdateCursoDto) {
    const { codigo } = updateCursoDto;
    try {
      const curso = await this.cursoRepository.findOne({
        where: { id: id },
        select: ['id'],
      });
      if (!curso) {
        throw new NotFoundException('No existe un curso con ese id');
      }

      if (codigo) {
        const codigoExistente = await this.cursoRepository.findOne({
          where: { id: Not(id), codigo: codigo },
          select: ['id'],
        });
        if (codigoExistente) {
          throw new ConflictException('Ya existe un curso con ese codigo');
        }
      }

      const cursoActualizado = await this.cursoRepository.update(id, {
        ...updateCursoDto,
      });

      if (cursoActualizado.affected === 0) {
        throw new InternalServerErrorException(
          'No se pudo actualizar el curso',
        );
      }

      const cursoActualizadoFinal = await this.cursoRepository.findOne({
        where: { id: id },
      });

      return cursoActualizadoFinal;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const curso = await this.cursoRepository.findOne({
        where: { id: id },
        select: ['id', 'estado'],
      });
      if (!curso) {
        throw new NotFoundException('No existe un curso con ese id');
      }
      const nuevoEstado = curso.estado === 1 ? 0 : 1;

      const cursoEliminado = await this.cursoRepository.update(id, {
        estado: nuevoEstado,
      });

      if (cursoEliminado.affected === 0) {
        throw new InternalServerErrorException(
          'No se pudo actualizar el curso',
        );
      }

      const cursoEliminadoFinal = await this.cursoRepository.findOne({
        where: { id: id },
        select: ['id', 'estado'],
      });

      return cursoEliminadoFinal;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
