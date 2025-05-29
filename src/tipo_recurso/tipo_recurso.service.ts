import { Injectable } from '@nestjs/common';
import { CreateTipoRecursoDto } from './dto/create-tipo_recurso.dto';
import { UpdateTipoRecursoDto } from './dto/update-tipo_recurso.dto';

@Injectable()
export class TipoRecursoService {
  create(createTipoRecursoDto: CreateTipoRecursoDto) {
    return 'This action adds a new tipoRecurso';
  }

  findAll() {
    return `This action returns all tipoRecurso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoRecurso`;
  }

  update(id: number, updateTipoRecursoDto: UpdateTipoRecursoDto) {
    return `This action updates a #${id} tipoRecurso`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoRecurso`;
  }
}
