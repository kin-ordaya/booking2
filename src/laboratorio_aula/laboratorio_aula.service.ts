import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateLaboratorioAulaDto } from './dto/create-laboratorio_aula.dto';
import { UpdateLaboratorioAulaDto } from './dto/update-laboratorio_aula.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LaboratorioAula } from './entities/laboratorio_aula.entity';
import { Repository } from 'typeorm';
import { Aula } from 'src/aula/entities/aula.entity';
import { Laboratorio } from 'src/laboratorio/entities/laboratorio.entity';

@Injectable()
export class LaboratorioAulaService {
  constructor(
    @InjectRepository(LaboratorioAula)
    private readonly laboratorioAulaRepository: Repository<LaboratorioAula>,
    @InjectRepository(Laboratorio)
    private readonly laboratorioRepository: Repository<Laboratorio>,
    @InjectRepository(Aula)
    private readonly aulaRepository: Repository<Aula>,
  ) {}

  async create(createLaboratorioAulaDto: CreateLaboratorioAulaDto) {
    try {
      const { laboratorio_id, aula_id } = createLaboratorioAulaDto;

      const [laboratorioAulaExist, laboratorioExiste, aulaExiste] =
        await Promise.all([
          this.laboratorioAulaRepository.existsBy({
            laboratorio: { id: laboratorio_id },
            aula: { id: aula_id },
            estado: 1,
          }),
          this.laboratorioRepository.existsBy({ id: laboratorio_id }),
          this.aulaRepository.existsBy({ id: aula_id }),
        ]);

      if (laboratorioAulaExist)
        throw new ConflictException(
          'Ya existe una asignacion de laboratorio a aula',
        );

      if (!laboratorioExiste) throw new NotFoundException('Laboratorio no encontrado');

      if (!aulaExiste) throw new NotFoundException('Aula no encontrada');

      const laboratorioAula = this.laboratorioAulaRepository.create({
        laboratorio: { id: laboratorio_id },
        aula: { id: aula_id },
      });
      return await this.laboratorioAulaRepository.save(laboratorioAula);
    } catch (error) {
      if(error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
    }
  }

  async findAll() {
    try {
      return await this.laboratorioAulaRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} laboratorioAula`;
  }

  update(id: number, updateLaboratorioAulaDto: UpdateLaboratorioAulaDto) {
    return `This action updates a #${id} laboratorioAula`;
  }

  remove(id: number) {
    return `This action removes a #${id} laboratorioAula`;
  }
}
