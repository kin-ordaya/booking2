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

      const campusExists = await this.campusRepository.existsBy({
        id: campus_id,
      });
      if (!campusExists) {
        throw new NotFoundException('No existe un campus con ese id');
      }

      const laboratorioExists = await this.laboratorioRepository.existsBy({
        codigo,
        campus: { id: campus_id },
      });
      if (laboratorioExists) {
        throw new ConflictException(
          'Ya existe un laboratorio con ese codigo y campus',
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

  async findAll() {
    try {
      return await this.laboratorioRepository.find({
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
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
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateLaboratorioDto: UpdateLaboratorioDto) {
    try {
      const { nombre, codigo, campus_id } = updateLaboratorioDto;

      if (!id) {
        throw new BadRequestException(
          'El ID del laboratorio no puede estar vacío',
        );
      }

      const laboratorio = await this.laboratorioRepository.findOneBy({ id });
      if (!laboratorio) {
        throw new NotFoundException(`Laboratorio con id ${id} no encontrado`);
      }

      // Validaciones para código y campus_id
      if (codigo !== undefined || campus_id !== undefined) {
        // Verificar si el campus existe si se proporciona campus_id
        if (campus_id !== undefined) {
          const campusExists = await this.campusRepository.existsBy({
            id: campus_id,
          });
          if (!campusExists) {
            throw new ConflictException('No existe un campus con ese id');
          }
        }

        // Si se proporciona tanto código como campus_id, verificar la combinación única
        if (codigo !== undefined && campus_id !== undefined) {
          const existingLab = await this.laboratorioRepository.findOne({
            where: {
              codigo,
              campus: { id: campus_id },
              id: Not(id),
            },
            relations: ['campus'],
          });

          if (existingLab) {
            throw new ConflictException(
              'Ya existe un laboratorio con el mismo código en este campus',
            );
          }
        }
        // Verificar solo código si se proporciona
        else if (codigo !== undefined) {
          const existingLab = await this.laboratorioRepository.findOne({
            where: {
              codigo,
              id: Not(id),
            },
          });

          if (existingLab) {
            throw new ConflictException(
              'Ya existe un laboratorio con el mismo código',
            );
          }
        }
        // Verificar solo campus si se proporciona (si tu lógica lo requiere)
        else if (campus_id !== undefined) {
          // Esta validación depende de tus reglas de negocio
          // Si no quieres permitir múltiples laboratorios en el mismo campus
          // con el mismo código, aquí deberías verificar junto con el código actual
          const existingLab = await this.laboratorioRepository.findOne({
            where: {
              campus: { id: campus_id },
              codigo: laboratorio.codigo, // Usar el código actual
              id: Not(id),
            },
            relations: ['campus'],
          });

          if (existingLab) {
            throw new ConflictException(
              'Ya existe un laboratorio con el mismo código en este campus',
            );
          }
        }
      }

      // Preparar datos para actualización
      const updateData: Partial<Laboratorio> & { campus?: any } = {};
      if (nombre !== undefined) {
        updateData.nombre = nombre;
      }
      if (codigo !== undefined) {
        updateData.codigo = codigo;
      }
      if (campus_id !== undefined) {
        updateData.campus = { id: campus_id };
      }

      if (Object.keys(updateData).length === 0) {
        return laboratorio;
      }

      await this.laboratorioRepository.update(id, updateData);

      // Recargar el laboratorio con sus relaciones si es necesario
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
      throw new InternalServerErrorException('Error inesperado');
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

      return this.laboratorioRepository.findOneBy({ id });
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
