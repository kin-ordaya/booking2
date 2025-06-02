import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async create(createPlanDto: CreatePlanDto) {
    try {
      const { nombre } = createPlanDto;
      if (await this.planRepository.existsBy({ nombre })) {
        throw new NotFoundException('Ya existe un plan con ese nombre');
      }
      const plan = this.planRepository.create({
        nombre,
      });
      return await this.planRepository.save(plan);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.planRepository.find();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findOne(id: string) {
    try {
      if (!(await this.planRepository.existsBy({ id: id }))) {
        throw new NotFoundException('No existe un plan con ese id');
      }
      return await this.planRepository.findOneBy({ id });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    try {
      const { nombre } = updatePlanDto;

      if (!(await this.planRepository.existsBy({ id: id }))) {
        throw new NotFoundException('No existe un plan con ese id');
      }

      if (nombre) {
        if (await this.planRepository.existsBy({ id: Not(id), nombre })) {
          throw new NotFoundException('Ya existe un plan con ese nombre');
        }
      }

      await this.planRepository.update(id, {
        nombre,
      });
      return await this.planRepository.findOneBy({ id });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.planRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Facultad no encontrada');
      return this.planRepository.findOneBy({ id });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
