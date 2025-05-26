import { Injectable } from '@nestjs/common';
import { CreateEapDto } from './dto/create-eap.dto';
import { UpdateEapDto } from './dto/update-eap.dto';

@Injectable()
export class EapService {
  create(createEapDto: CreateEapDto) {
    return 'This action adds a new eap';
  }

  findAll() {
    return `This action returns all eap`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eap`;
  }

  update(id: number, updateEapDto: UpdateEapDto) {
    return `This action updates a #${id} eap`;
  }

  remove(id: number) {
    return `This action removes a #${id} eap`;
  }
}
