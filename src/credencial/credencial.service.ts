import { Injectable } from '@nestjs/common';
import { CreateCredencialDto } from './dto/create-credencial.dto';
import { UpdateCredencialDto } from './dto/update-credencial.dto';

@Injectable()
export class CredencialService {
  create(createCredencialDto: CreateCredencialDto) {
    return 'This action adds a new credencial';
  }

  findAll() {
    return `This action returns all credencial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} credencial`;
  }

  update(id: number, updateCredencialDto: UpdateCredencialDto) {
    return `This action updates a #${id} credencial`;
  }

  remove(id: number) {
    return `This action removes a #${id} credencial`;
  }
}
