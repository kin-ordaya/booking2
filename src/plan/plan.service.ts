import {
  BadRequestException,
  ConflictException,
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

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    try {
      const { nombre } = createPlanDto;

      if (await this.planRepository.existsBy({ nombre })) {
        throw new ConflictException('Ya existe un plan con ese nombre');
      }
      const plan = this.planRepository.create({
        nombre,
      });
      return await this.planRepository.save(plan);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.planRepository.find({
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string): Promise<Plan> {
    try {
      if (!id)
        throw new BadRequestException('El ID del plan no puede estar vacío');

      const plan = await this.planRepository.findOneBy({ id });
      if (!plan) throw new NotFoundException('Plan no encontrado');
      return plan;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    try {
      const { nombre } = updatePlanDto;

      if (!id) {
        throw new BadRequestException('El ID del plan no puede estar vacío');
      }

      const plan = await this.planRepository.findOneBy({ id });
      
      if (!plan) {
        throw new NotFoundException('Plan no encontrado');
      }

      const updateData: any = {};

      if (nombre !== undefined) {
        const nombreExists = await this.planRepository.existsBy({
          id: Not(id),
          nombre,
        });

        if (nombreExists) {
          throw new ConflictException('Ya existe un plan con ese nombre');
        }

        updateData.nombre = nombre;
      }

      if (Object.keys(updateData).length === 0) {
        return plan;
      }

      await this.planRepository.update(id, {
        nombre,
      });

      return await this.planRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del plan no puede estar vacío');

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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
