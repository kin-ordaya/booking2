import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEapDto } from './dto/create-eap.dto';
import { UpdateEapDto } from './dto/update-eap.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Eap } from './entities/eap.entity';
import { Facultad } from 'src/facultad/entities/facultad.entity';
import { isUUID } from 'class-validator';

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
      console.error(error);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.eapRepository.find();
    } catch (error) {
      console.error(error);
      throw error;
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
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateEapDto: UpdateEapDto) {
    try {
      const { nombre } = updateEapDto;

      if (!(await this.eapRepository.existsBy({ id: id }))) {
        throw new NotFoundException('No existe un eap con ese id');
      }

      if (nombre) {
        if (await this.eapRepository.existsBy({ id: Not(id), nombre })) {
          throw new ConflictException('Ya existe un eap con ese nombre');
        }
      }
      await this.eapRepository.update(id, {
        nombre,
      });
      return await this.eapRepository.findOneBy({ id });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const updateResult = await this.eapRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => '1 - estado' }) // Toggle directo en SQL
        .where('id = :id', { id })
        .execute();

      if (updateResult.affected === 0) {
        throw new NotFoundException('Eap no encontrada');
      }
      return await this.eapRepository.findOneBy({ id });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
