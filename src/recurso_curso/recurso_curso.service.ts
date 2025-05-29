import { Injectable } from '@nestjs/common';
import { CreateRecursoCursoDto } from './dto/create-recurso_curso.dto';
import { UpdateRecursoCursoDto } from './dto/update-recurso_curso.dto';

@Injectable()
export class RecursoCursoService {
  create(createRecursoCursoDto: CreateRecursoCursoDto) {
    return 'This action adds a new recursoCurso';
  }

  findAll() {
    return `This action returns all recursoCurso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recursoCurso`;
  }

  update(id: number, updateRecursoCursoDto: UpdateRecursoCursoDto) {
    return `This action updates a #${id} recursoCurso`;
  }

  remove(id: number) {
    return `This action removes a #${id} recursoCurso`;
  }
}
