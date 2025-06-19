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

      const aulaExists = await this.aulaRepository.findOne({
        where: { codigo, pabellon: { id: pabellon_id } },
        relations: ['pabellon'],
      });

      if (aulaExists) {
        throw new ConflictException('Ya existe un aula con ese codigo');
      }

      const pabellonExists = await this.pabellonRepository.existsBy({
        id: pabellon_id,
      });

      if (!pabellonExists) {
        throw new NotFoundException('Ya existe un campus con ese codigo');
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
    try {
      return await this.aulaRepository.find({ order: { nombre: 'ASC' } });
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del aula no puede estar vacío');

      const aula = await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });

      if (!aula) throw new NotFoundException(`Aula con id ${id} no encontrado`);

      return aula;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
  //TODO: agregar validaciones de campus_id, nombre si se envia uno o ambos parametros
  async update(id: string, updateAulaDto: UpdateAulaDto) {
    try {
      const { nombre, codigo, pabellon_id } = updateAulaDto;

      if (!id) {
        throw new BadRequestException('El ID del aula no puede estar vacío');
      }

      const aula = await this.aulaRepository.findOne({
        where: { id },
        relations: ['pabellon'],
      });
      if (!aula) {
        throw new NotFoundException(`Aula con id ${id} no encontrado`);
      }

      const updateData: any = {};

      if (nombre !== undefined) {
        updateData.nombre = nombre;
      }

      if (codigo !== undefined) {
        const codigoExists = await this.aulaRepository.existsBy({
          id: Not(id),
          codigo,
        });

        if (codigoExists) {
          throw new ConflictException('Ya existe un aula con ese codigo');
        }
        updateData.codigo = codigo;
      }

      if (pabellon_id !== undefined) {
        const pabellonExists = await this.pabellonRepository.existsBy({
          id: pabellon_id,
        });
        if (!pabellonExists) {
          throw new NotFoundException('No existe un campus con ese id');
        }
        updateData.pabellon = { id: pabellon_id };
      }

      if (Object.keys(updateData).length === 0) {
        return aula;
      }

      await this.aulaRepository.update(id, updateData);
      return await this.aulaRepository.findOneBy({ id });
    } catch (error) {
      
    }
  }

  async remove(id: string) {
    try {
      return `This action removes a #${id} aula`;
    } catch (error) {
      
    }
  }
}
