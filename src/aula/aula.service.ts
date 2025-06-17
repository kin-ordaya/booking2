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
import { Campus } from 'src/campus/entities/campus.entity';

@Injectable()
export class AulaService {
  constructor(
    @InjectRepository(Aula)
    private readonly aulaRepository: Repository<Aula>,
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
  ) {}

  async create(createAulaDto: CreateAulaDto) {
    try {
      const { nombre, codigo, piso, pabellon, campus_id } = createAulaDto;
      const aulaExists = await this.aulaRepository.findOne({
        where: { codigo, campus: { id: campus_id } },
        relations: ['campus'],
      });
      const campusExists = await this.campusRepository.existsBy({
        id: campus_id,
      });

      if (!campusExists) {
        throw new ConflictException('Ya existe un campus con ese codigo');
      }
      if (aulaExists) {
        throw new ConflictException('Ya existe un aula con ese codigo');
      }

      const aula = this.aulaRepository.create({
        codigo,
        nombre,
        piso,
        pabellon,
        campus: { id: campus_id },
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
