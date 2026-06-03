import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';
import { Laboratorio } from './entities/laboratorio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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

      const [campusExists, laboratorioExists] = await Promise.all([
        this.campusRepository.existsBy({ id: campus_id }),
        this.laboratorioRepository.existsBy({ codigo }),
      ]);

      if (!campusExists) {
        throw new NotFoundException('No existe un campus con ese id');
      }

      if (laboratorioExists) {
        throw new ConflictException('Ya existe un laboratorio con ese codigo');
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
      throw new InternalServerErrorException('Error al crear laboratorio');
    }
  }

  async findAll() {
    try {
      return await this.laboratorioRepository.find({
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los laboratorios',
      );
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del laboratorio no puede estar vacío',
        );

      const laboratorio = await this.laboratorioRepository.findOne({
        where: { id },
        relations: ['campus'],
      });

      if (!laboratorio)
        throw new NotFoundException(`Laboratorio con id ${id} no encontrado`);

      return laboratorio;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error al obtener el laboratorio');
    }
  }

  async update(id: string, updateLaboratorioDto: UpdateLaboratorioDto) {
    try {
      if (!id) {
        throw new BadRequestException(
          'El ID del laboratorio no puede estar vacío',
        );
      }

      const { nombre, codigo, campus_id } = updateLaboratorioDto;

      const laboratorio = await this.laboratorioRepository.findOne({
        where: { id },
        relations: ['campus'],
      });
      if (!laboratorio) {
        throw new NotFoundException(`Laboratorio con id ${id} no encontrado`);
      }

      const updateData: Partial<Laboratorio> & { campus?: any } = {};
      const validations: Promise<any>[] = [];

      if (codigo !== undefined && codigo !== laboratorio.codigo) {
        validations.push(
          this.laboratorioRepository
            .existsBy({
              id: Not(id),
              codigo,
            })
            .then((exists) => {
              if (exists) {
                throw new ConflictException(
                  'Ya existe un laboratorio con el mismo código',
                );
              }
              updateData.codigo = codigo;
            }),
        );
      }

      if (campus_id !== undefined && campus_id !== laboratorio.campus.id) {
        validations.push(
          this.campusRepository
            .existsBy({
              id: campus_id,
            })
            .then((exists) => {
              if (!exists) {
                throw new ConflictException('No existe un campus con ese id');
              }
              updateData.campus = { id: campus_id };
            }),
        );
      }

      if (validations.length > 0) {
        await Promise.all(validations);
      }

      if (nombre !== undefined && nombre !== laboratorio.nombre) {
        updateData.nombre = nombre;
      }

      if (Object.keys(updateData).length === 0) {
        return laboratorio;
      }

      await this.laboratorioRepository.update(id, updateData);

      return await this.laboratorioRepository.findOne({
        where: { id },
        relations: ['campus'],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar el laboratorio',
      );
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del laboratorio no puede estar vacío',
        );

      const result = await this.laboratorioRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Laboratorio no encontrado');

      return this.laboratorioRepository.findOne({
        where: { id },
        relations: ['campus'],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        'Error al deshabilitar/habilitar el laboratorio',
      );
    }
  }
}
