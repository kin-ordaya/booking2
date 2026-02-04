import { Injectable } from '@nestjs/common';
import { CreateRecursoCursoModalidadPeriodoDto } from './dto/create-recurso_curso_modalidad_periodo.dto';
import { UpdateRecursoCursoModalidadPeriodoDto } from './dto/update-recurso_curso_modalidad_periodo.dto';

@Injectable()
export class RecursoCursoModalidadPeriodoService {
  create(createRecursoCursoModalidadPeriodoDto: CreateRecursoCursoModalidadPeriodoDto) {
    return 'This action adds a new recursoCursoModalidadPeriodo';
  }

  findAll() {
    return `This action returns all recursoCursoModalidadPeriodo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recursoCursoModalidadPeriodo`;
  }

  update(id: number, updateRecursoCursoModalidadPeriodoDto: UpdateRecursoCursoModalidadPeriodoDto) {
    return `This action updates a #${id} recursoCursoModalidadPeriodo`;
  }

  remove(id: number) {
    return `This action removes a #${id} recursoCursoModalidadPeriodo`;
  }
}
