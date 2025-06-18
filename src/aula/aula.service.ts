import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Aula } from './entities/aula.entity';
import { Repository } from 'typeorm';

import { Pabellon } from 'src/pabellon/entities/pabellon.entity';

@Injectable()
export class AulaService {
  constructor(
    @InjectRepository(Aula)
    private readonly aulaRepository: Repository<Aula>,
    @InjectRepository(Pabellon)
    private readonly pabellonRepository: Repository<Pabellon>,
  ) {}

  async create(createAulaDto: CreateAulaDto) {
    try {
      const { nombre, codigo, pabellon_id } = createAulaDto;
      const aulaExists = await this.aulaRepository.findOne({
        where: { codigo, pabellon: { id: pabellon_id } },
        relations: ['pabellon'],
      });

      const pabellonExists = await this.pabellonRepository.existsBy({
        id: pabellon_id,
      });

      if (!pabellonExists) {
        throw new ConflictException('Ya existe un campus con ese codigo');
      }
      if (aulaExists) {
        throw new ConflictException('Ya existe un aula con ese codigo');
      }

      const aula = this.aulaRepository.create({
        codigo,
        nombre,
        pabellon: { id: pabellon_id },
      });
      return await this.aulaRepository.save(aula);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    return `This action returns all aula`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} aula`;
  }

  async update(id: string, updateAulaDto: UpdateAulaDto) {
    return `This action updates a #${id} aula`;
  }

  async remove(id: string) {
    return `This action removes a #${id} aula`;
  }
}
