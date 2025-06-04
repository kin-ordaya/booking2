import { Injectable } from '@nestjs/common';
import { CreateCredencialDto } from './dto/create-credencial.dto';
import { UpdateCredencialDto } from './dto/update-credencial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Credencial } from './entities/credencial.entity';
import { Repository } from 'typeorm';
import { Recurso } from 'src/recurso/entities/recurso.entity';

@Injectable()
export class CredencialService {
  constructor(
    @InjectRepository(Credencial)
    private readonly credencialRepository: Repository<Credencial>,

    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
  ) {}

  async create(createCredencialDto: CreateCredencialDto) {
    try {
      const { usuario, clave, capacidad, tipo, recurso_id } = createCredencialDto;
    } catch (error) {
      
    }
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
