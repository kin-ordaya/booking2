import { Injectable } from '@nestjs/common';
import { CreateRecursoCursoModalidadDto } from './dto/create-recurso_curso_modalidad.dto';
import { UpdateRecursoCursoModalidadDto } from './dto/update-recurso_curso_modalidad.dto';

@Injectable()
export class RecursoCursoModalidadService {
  create(createRecursoCursoModalidadDto: CreateRecursoCursoModalidadDto) {
    return 'This action adds a new recursoCursoModalidad';
  }

  findAll() {
    return `This action returns all recursoCursoModalidad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recursoCursoModalidad`;
  }

  update(id: number, updateRecursoCursoModalidadDto: UpdateRecursoCursoModalidadDto) {
    return `This action updates a #${id} recursoCursoModalidad`;
  }

  remove(id: number) {
    return `This action removes a #${id} recursoCursoModalidad`;
  }
}
