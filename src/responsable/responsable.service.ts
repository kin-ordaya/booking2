import { Injectable } from '@nestjs/common';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';

@Injectable()
export class ResponsableService {
  create(createResponsableDto: CreateResponsableDto) {
    return 'This action adds a new responsable';
  }

  findAll() {
    return `This action returns all responsable`;
  }

  findOne(id: number) {
    return `This action returns a #${id} responsable`;
  }

  update(id: number, updateResponsableDto: UpdateResponsableDto) {
    return `This action updates a #${id} responsable`;
  }

  remove(id: number) {
    return `This action removes a #${id} responsable`;
  }
}
