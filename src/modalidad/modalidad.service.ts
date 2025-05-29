import { Injectable } from '@nestjs/common';
import { CreateModalidadDto } from './dto/create-modalidad.dto';
import { UpdateModalidadDto } from './dto/update-modalidad.dto';

@Injectable()
export class ModalidadService {
  create(createModalidadDto: CreateModalidadDto) {
    return 'This action adds a new modalidad';
  }

  findAll() {
    return `This action returns all modalidad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} modalidad`;
  }

  update(id: number, updateModalidadDto: UpdateModalidadDto) {
    return `This action updates a #${id} modalidad`;
  }

  remove(id: number) {
    return `This action removes a #${id} modalidad`;
  }
}
