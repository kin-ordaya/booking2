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

  async create(createAulaDto: CreateAulaDto):Promise<Aula> {
    try {
      const { nombre, codigo, pabellon_id } = createAulaDto;

      const [aulaExists, pabellonExists] = await Promise.all([
        this.aulaRepository.existsBy({
          nombre,
          pabellon: { id: pabellon_id },
        }),
        this.pabellonRepository.existsBy({ id: pabellon_id }),
      ]);

      if (aulaExists) {
        throw new ConflictException(
          `Ya existe un aula con nombre ${nombre} y pabellón ${pabellon_id}`,
        );
      }

      if (!pabellonExists) {
        throw new NotFoundException(
          `No existe un pabellón con ese ID ${pabellon_id}`,
        );
      }

      const aula = this.aulaRepository.create({
        codigo,
        nombre,
        pabellon: { id: pabellon_id },
      });

      return await this.aulaRepository.save(aula);
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

      const { nombre, codigo, pabellon_id } = updateAulaDto;

      const aula = await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });

      if (!aula) {
        throw new NotFoundException(`Aula con ID ${id} no encontrada`);
      }

      const updateData: any = {};
      const validations: Promise<any>[] = [];

      if (nombre !== undefined && nombre !== aula.nombre) {
        validations.push(
          this.aulaRepository
            .existsBy({
              id: Not(id),
              nombre,
            })
            .then((exists) => {
              if (exists) {
                throw new ConflictException(
                  `Ya existe un aula con nombre ${nombre}`,
                );
              }
              updateData.nombre = nombre;
            }),
        );
      }

      if (pabellon_id !== undefined && pabellon_id !== aula.pabellon.id) {
        validations.push(
          this.pabellonRepository
            .existsBy({
              id: pabellon_id,
            })
            .then((exists) => {
              if (!exists) {
                throw new NotFoundException(
                  `No existe un pabellón con ese ID ${pabellon_id}`,
                );
              }
              updateData.pabellon = { id: pabellon_id };
            }),
        );
      }

      if (validations.length > 0) {
        await Promise.all(validations);
      }

      if (codigo !== undefined) {
        updateData.codigo = codigo;
      }

      if (Object.keys(updateData).length === 0) {
        return aula;
      }

      await this.aulaRepository.update(id, updateData);

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

      return await this.aulaRepository.findOne({ where: { id } });
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
