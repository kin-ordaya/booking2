import { Injectable } from '@nestjs/common';
import { CreateClaseAulaDto } from './dto/create-clase_aula.dto';
import { UpdateClaseAulaDto } from './dto/update-clase_aula.dto';

@Injectable()
export class ClaseAulaService {
  create(createClaseAulaDto: CreateClaseAulaDto) {
    return 'This action adds a new claseAula';
  }

  findAll() {
    return `This action returns all claseAula`;
  }

  findOne(id: number) {
    return `This action returns a #${id} claseAula`;
  }

  update(id: number, updateClaseAulaDto: UpdateClaseAulaDto) {
    return `This action updates a #${id} claseAula`;
  }

  remove(id: number) {
    return `This action removes a #${id} claseAula`;
  }
}
