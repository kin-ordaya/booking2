import { Injectable } from '@nestjs/common';
import { CreateCursoModalidadDto } from './dto/create-curso_modalidad.dto';
import { UpdateCursoModalidadDto } from './dto/update-curso_modalidad.dto';

@Injectable()
export class CursoModalidadService {
  create(createCursoModalidadDto: CreateCursoModalidadDto) {
    return 'This action adds a new cursoModalidad';
  }

  findAll() {
    return `This action returns all cursoModalidad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cursoModalidad`;
  }

  update(id: number, updateCursoModalidadDto: UpdateCursoModalidadDto) {
    return `This action updates a #${id} cursoModalidad`;
  }

  remove(id: number) {
    return `This action removes a #${id} cursoModalidad`;
  }
}
