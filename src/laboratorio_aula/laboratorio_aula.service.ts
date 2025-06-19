import { Injectable } from '@nestjs/common';
import { CreateLaboratorioAulaDto } from './dto/create-laboratorio_aula.dto';
import { UpdateLaboratorioAulaDto } from './dto/update-laboratorio_aula.dto';

@Injectable()
export class LaboratorioAulaService {
  create(createLaboratorioAulaDto: CreateLaboratorioAulaDto) {
    return 'This action adds a new laboratorioAula';
  }

  findAll() {
    return `This action returns all laboratorioAula`;
  }

  findOne(id: number) {
    return `This action returns a #${id} laboratorioAula`;
  }

  update(id: number, updateLaboratorioAulaDto: UpdateLaboratorioAulaDto) {
    return `This action updates a #${id} laboratorioAula`;
  }

  remove(id: number) {
    return `This action removes a #${id} laboratorioAula`;
  }
}
