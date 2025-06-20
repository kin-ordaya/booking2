import { Injectable } from '@nestjs/common';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { Repository } from 'typeorm';
import { Aula } from 'src/aula/entities/aula.entity';

@Injectable()
export class ClaseService {
  constructor(
    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,
    @InjectRepository(Aula)
    private readonly aulaRepository: Repository<Aula>
  ) {}

  async create(createClaseDto: CreateClaseDto) {
    return 'This action adds a new clase';
  }

  async findAll() {
    return `This action returns all clase`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} clase`;
  }

  async update(id: string, updateClaseDto: UpdateClaseDto) {
    return `This action updates a #${id} clase`;
  }

  async remove(id: string) {
    return `This action removes a #${id} clase`;
  }
}
