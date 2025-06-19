import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';
import { Laboratorio } from './entities/laboratorio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campus } from 'src/campus/entities/campus.entity';

@Injectable()
export class LaboratorioService {
  constructor(
    @InjectRepository(Laboratorio)
    private readonly laboratorioRepository: Repository<Laboratorio>,
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
  ) {}

  async create(createLaboratorioDto: CreateLaboratorioDto) {
    try {
      const { nombre, codigo, campus_id } = createLaboratorioDto;

      const campusExists = await this.campusRepository.existsBy({
        id: campus_id,
      });
      if (!campusExists) {
        throw new NotFoundException('No existe un campus con ese id');
      }

      const laboratorioExists = await this.laboratorioRepository.existsBy({
        nombre,
        campus: { id: campus_id },
      });
      if (laboratorioExists) {
        throw new ConflictException(
          'Ya existe un laboratorio con ese nombre y campus',
        );
      }

      const laboratorio = this.laboratorioRepository.create({
        nombre,
        codigo,
        campus: { id: campus_id },
      });

      return await this.laboratorioRepository.save(laboratorio);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  findAll() {
    return `This action returns all laboratorio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} laboratorio`;
  }

  update(id: number, updateLaboratorioDto: UpdateLaboratorioDto) {
    return `This action updates a #${id} laboratorio`;
  }

  remove(id: number) {
    return `This action removes a #${id} laboratorio`;
  }
}
