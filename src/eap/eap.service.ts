import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEapDto } from './dto/create-eap.dto';
import { UpdateEapDto } from './dto/update-eap.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Eap } from './entities/eap.entity';
import { Facultad } from 'src/facultad/entities/facultad.entity';

@Injectable()
export class EapService {
  constructor(
    @InjectRepository(Eap)
    private readonly eapRepository: Repository<Eap>,
    @InjectRepository(Facultad)
    private readonly facultadRepository: Repository<Facultad>,
  ) {}

  async create(createEapDto: CreateEapDto) {
    try {
      const { nombre, facultad_id } = createEapDto;

      if (!(await this.facultadRepository.existsBy({ id: facultad_id }))) {
        throw new NotFoundException('No existe una facultad con ese id');
      }

      if (await this.eapRepository.existsBy({ nombre })) {
        throw new ConflictException('Ya existe un eap con ese nombre');
      }

      const eap = this.eapRepository.create({
        nombre,
        facultad: { id: facultad_id },
      });
      return await this.eapRepository.save(eap);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.eapRepository.find();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findOne(id: string) {
    try {
      if (!(await this.eapRepository.existsBy({ id: id }))) {
        throw new NotFoundException('No existe un eap con ese id');
      }

      return await this.eapRepository.findOne({
        where: { id: id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateEapDto: UpdateEapDto) {
    try {
      const { nombre, facultad_id } = updateEapDto;

      if (!(await this.eapRepository.existsBy({ id: id }))) {
        throw new NotFoundException('No existe un eap con ese id');
      }

      if (facultad_id) {
        if (! await this.facultadRepository.existsBy({ id: facultad_id })) {
          throw new NotFoundException('No existe una facultad con ese id');
        }
      }

      if (nombre) {
        if (await this.eapRepository.existsBy({ id: Not(id), nombre })) {
          throw new ConflictException('Ya existe un eap con ese nombre');
        }
      }
      await this.eapRepository.update(id, {
        nombre,
        facultad: { id: facultad_id },
      });
      return await this.eapRepository.findOneBy({ id });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.eapRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Facultad no encontrada');
      return this.eapRepository.findOneBy({ id });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
