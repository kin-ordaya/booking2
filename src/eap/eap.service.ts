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
      throw new InternalServerErrorException('Error al crear EAP');
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
      );
    }
  }

  async findOne(id: string): Promise<Eap> {
    try {
      if (!id)
        throw new BadRequestException('El ID de la EAP no puede estar vacío');

      const eap = await this.eapRepository.findOne({
        where: { id },
        relations: ['facultad'],
      });
      if (!eap) throw new NotFoundException('EAP no encontrado');
      return eap;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener la EAP');
    }
  }

  async findOneByNombre(nombre: string): Promise<Eap> {
    try {
      if (!nombre)
        throw new BadRequestException(
          'El nombre de la EAP no puede estar vacío',
        );

      const eap = await this.eapRepository.findOne({ where: { nombre } });
      if (!eap) throw new NotFoundException('EAP no encontrado');
      return eap;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener la EAP por nombre',
      );
    }
  }

  async update(id: string, updateEapDto: UpdateEapDto) {
    try {
      if (!id) {
        throw new BadRequestException('El ID de la EAP no puede estar vacío');
      }

      const { nombre, facultad_id } = updateEapDto;

      const eap = await this.eapRepository.findOne({
        where: { id },
        relations: ['facultad'],
      });
      if (!eap) {
        throw new NotFoundException('EAP no encontrada');
      }

      const updateData: any = {};
      const validations: Promise<any>[] = [];

      if (nombre !== undefined && nombre !== eap.nombre) {
        validations.push(
          this.eapRepository
            .existsBy({
              id: Not(id),
              nombre,
            })
            .then((exists) => {
              if (exists) {
                throw new ConflictException('Ya existe una EAP con ese nombre');
              }
              updateData.nombre = nombre;
            }),
        );
      }

      if (facultad_id !== undefined && facultad_id !== eap.facultad.id) {
        validations.push(
          this.facultadRepository
            .existsBy({
              id: facultad_id,
            })
            .then((exists) => {
              if (!exists) {
                throw new NotFoundException(
                  'No existe una facultad con ese ID',
                );
              }
              updateData.facultad = { id: facultad_id };
            }),
        );
      }
      if (Object.keys(updateData).length === 0) {
        return eap;
      }

      await this.eapRepository.update(id, updateData);

      return await this.eapRepository.findOne({
        where: { id },
        relations: ['facultad'],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la EAP');
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

      return this.eapRepository.findOne(
        { where: { id }, relations: ['facultad'] },
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        'Error al deshabilitar/habilitar EAP',
      );
    }
  }
}
