import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Aula } from './entities/aula.entity';
import { Not, Repository } from 'typeorm';
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

      const [aulaExists, pabellonExists] = await Promise.all([
        this.aulaRepository.existsBy({
          nombre,
          pabellon: { id: pabellon_id },
        }),

        this.pabellonRepository.existsBy({
          id: pabellon_id,
        }),
      ]);

      if (aulaExists) {
        throw new ConflictException(
          `Ya existe un aula con nombre "${nombre}" en el pabellón especificado`,
        );
      }

      if (!pabellonExists) {
        throw new NotFoundException(
          `No existe un pabellón con ID: ${pabellon_id}`,
        );
      }

      const aula = this.aulaRepository.create({
        codigo,
        nombre,
        pabellon: { id: pabellon_id },
      });

      const savedAula = await this.aulaRepository.save(aula);

      return savedAula;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear aula');
    }
  }

  async findAll() {
    try {
      const aulas = await this.aulaRepository.find({
        order: { nombre: 'ASC' },
      });

      return aulas;
    } catch (error) {
      throw new InternalServerErrorException('Error al recuperar aulas');
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('El ID del aula no puede estar vacío');
      }

      const aula = await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });

      if (!aula) {
        throw new NotFoundException(`Aula con ID ${id} no encontrada`);
      }

      return aula;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al recuperar aula');
    }
  }

  async update(id: string, updateAulaDto: UpdateAulaDto) {
    try {
      if (!id) {
        throw new BadRequestException('ID del aula vacío');
      }

      const aulaExists = await this.aulaRepository.existsBy({ id });

      if (!aulaExists) {
        throw new NotFoundException(`Aula con ID ${id} no encontrada`);
      }

      const { codigo, pabellon_id } = updateAulaDto;

      const validations: Promise<any>[] = [];

      if (codigo !== undefined) {
        validations.push(
          this.aulaRepository
            .existsBy({ id: Not(id), codigo })
            .then((exists) => {
              if (exists) throw new ConflictException('Código ya existe');
            }),
        );
      }

      if (pabellon_id !== undefined) {
        validations.push(
          this.pabellonRepository
            .existsBy({ id: pabellon_id })
            .then((exists) => {
              if (!exists) throw new NotFoundException('Pabellón no existe');
            }),
        );
      }

      if (validations.length > 0) {
        await Promise.all(validations);
      }

      await this.aulaRepository.update(id, updateAulaDto);

      return await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar aula');
    }
  }

  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID del aula vacío');
      }

      const aulaExists = await this.aulaRepository.existsBy({ id });

      if (!aulaExists) {
        throw new NotFoundException(`Aula con id ${id} no encontrada`);
      }

      const result = await this.aulaRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(
          'No se afectaron registros al cambiar estado ',
        );
      }

      return await this.aulaRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error en la deshabilitación/habilitación de aula',
      );
    }
  }
}
