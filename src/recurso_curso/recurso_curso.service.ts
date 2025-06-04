import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecursoCursoDto } from './dto/create-recurso_curso.dto';
import { UpdateRecursoCursoDto } from './dto/update-recurso_curso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from 'src/curso/entities/curso.entity';
import { Repository } from 'typeorm';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { RecursoCurso } from './entities/recurso_curso.entity';

@Injectable()
export class RecursoCursoService {
  constructor(
    @InjectRepository(RecursoCurso)
    private readonly recursoCursoRepository: Repository<RecursoCurso>,
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  async create(
    createRecursoCursoDto: CreateRecursoCursoDto,
  ): Promise<RecursoCurso> {
    try {
      const { recurso_id, curso_id } = createRecursoCursoDto;

      const [recursoExists, cursoExists, recursoCursoExists] =
        await Promise.all([
          this.recursoRepository.existsBy({ id: recurso_id }),
          this.cursoRepository.existsBy({ id: curso_id }),
          this.recursoCursoRepository.existsBy({
            curso: { id: curso_id },
            recurso: { id: recurso_id },
          }),
        ]);

      if (!recursoExists)
        throw new NotFoundException('No existe un recurso con ese id');

      if (!cursoExists)
        throw new NotFoundException('No existe un curso con ese id');

      if (recursoCursoExists)
        throw new ConflictException(
          'Ya existe una asignacion de recurso a curso',
        );

      const recursoCurso = this.recursoCursoRepository.create({
        recurso: { id: recurso_id },
        curso: { id: curso_id },
      });
      return await this.recursoCursoRepository.save(recursoCurso);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.recursoCursoRepository.find({
        relations: ['recurso', 'curso'],
        order: { asignacion: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} recursoCurso`;
  }

  async update(id: number, updateRecursoCursoDto: UpdateRecursoCursoDto) {
    return `This action updates a #${id} recursoCurso`;
  }

  async remove(id: number) {
    return `This action removes a #${id} recursoCurso`;
  }
}
