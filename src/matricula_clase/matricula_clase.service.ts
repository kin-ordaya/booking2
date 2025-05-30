import { Injectable } from '@nestjs/common';
import { CreateMatriculaClaseDto } from './dto/create-matricula_clase.dto';
import { UpdateMatriculaClaseDto } from './dto/update-matricula_clase.dto';

@Injectable()
export class MatriculaClaseService {
  create(createMatriculaClaseDto: CreateMatriculaClaseDto) {
    return 'This action adds a new matriculaClase';
  }

  findAll() {
    return `This action returns all matriculaClase`;
  }

  findOne(id: number) {
    return `This action returns a #${id} matriculaClase`;
  }

  update(id: number, updateMatriculaClaseDto: UpdateMatriculaClaseDto) {
    return `This action updates a #${id} matriculaClase`;
  }

  remove(id: number) {
    return `This action removes a #${id} matriculaClase`;
  }
}
