import { Injectable } from '@nestjs/common';
import { CreateRecursoCursoPeriodoDto } from './dto/create-recurso_curso_periodo.dto';
import { UpdateRecursoCursoPeriodoDto } from './dto/update-recurso_curso_periodo.dto';

@Injectable()
export class RecursoCursoPeriodoService {
  create(createRecursoCursoPeriodoDto: CreateRecursoCursoPeriodoDto) {
    return 'This action adds a new recursoCursoPeriodo';
  }

  findAll() {
    return `This action returns all recursoCursoPeriodo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recursoCursoPeriodo`;
  }

  update(id: number, updateRecursoCursoPeriodoDto: UpdateRecursoCursoPeriodoDto) {
    return `This action updates a #${id} recursoCursoPeriodo`;
  }

  remove(id: number) {
    return `This action removes a #${id} recursoCursoPeriodo`;
  }
}
