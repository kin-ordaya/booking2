import {
  BadRequestException,
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

  async create(createEapDto: CreateEapDto): Promise<Eap> {
    try {
      const { nombre, facultad_id } = createEapDto;

      const [facultadExists, nombreExists] = await Promise.all([
        this.facultadRepository.existsBy({ id: facultad_id }),
        this.eapRepository.existsBy({ nombre }),
      ]);

      if (!facultadExists)
        throw new NotFoundException('No existe una facultad con ese id');

      if (nombreExists)
        throw new ConflictException('Ya existe un eap con ese nombre');

      const eap = this.eapRepository.create({
        nombre,
        facultad: { id: facultad_id },
      });
      return await this.eapRepository.save(eap);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll(): Promise<Eap[]> {
    try {
      return await this.eapRepository.find({
        relations: ['facultad'],
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocurrió un error al recuperar las EAPs',
        { cause: error },
      );
    }
  }

  async findOne(id: string): Promise<Eap> {
    try {
      if (!id)
        throw new BadRequestException('El ID de la EAP no puede estar vacío');

      const eap = await this.eapRepository.findOneBy({ id });
      if (!eap) throw new NotFoundException('EAP no encontrado');
      return eap;
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

  async update(id: string, updateEapDto: UpdateEapDto) {
    try {
      const { nombre, facultad_id } = updateEapDto;

      if (!id) {
        throw new BadRequestException('El ID de la EAP no puede estar vacío');
      }

      // Verificar si la EAP existe
      const eap = await this.eapRepository.findOneBy({ id });
      if (!eap) {
        throw new NotFoundException('EAP no encontrada');
      }

      // Preparar objeto de actualización
      const updateData: any = {};

      if (nombre !== undefined) {
        // Verificar si el nombre ya existe (excluyendo la actual EAP)
        const nombreExists = await this.eapRepository.existsBy({
          id: Not(id),
          nombre,
        });

        if (nombreExists) {
          throw new ConflictException('Ya existe una EAP con ese nombre');
        }
        updateData.nombre = nombre;
      }

      if (facultad_id !== undefined) {
        // Verificar si la facultad existe
        const facultadExists = await this.facultadRepository.existsBy({
          id: facultad_id,
        });

        if (!facultadExists) {
          throw new NotFoundException('No existe una facultad con ese ID');
        }
        updateData.facultad = { id: facultad_id };
      }

      // Si no hay nada que actualizar
      if (Object.keys(updateData).length === 0) {
        return eap; // O podrías lanzar un error
      }

      // Realizar la actualización
      await this.eapRepository.update(id, updateData);

      // Retornar la EAP actualizada
      return await this.eapRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error inesperado al actualizar la EAP',
      );
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID de la EAP no puede estar vacío');

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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
