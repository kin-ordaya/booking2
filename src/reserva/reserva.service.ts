import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Repository } from 'typeorm';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Clase } from 'src/clase/entities/clase.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,

    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,

    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,

    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,
  ) {}

  async create(createReservaDto: CreateReservaDto) {
    try {
      const {
        mantenimiento,
        descripcion,
        programacion,
        cantidad,
        recurso_id,
        clase_id,
        rol_usuario_id,
      } = createReservaDto;

      const reserva = await this.reservaRepository.create({
        mantenimiento,
        descripcion,
        programacion,
        cantidad,
        recurso: {id: recurso_id},
        clase: {id: clase_id},
        rolUsuario: {id: rol_usuario_id},

      });
      return await this.reservaRepository.save(reserva);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    return `This action returns all reserva`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} reserva`;
  }

  async update(id: string, updateReservaDto: UpdateReservaDto) {
    return `This action updates a #${id} reserva`;
  }

  async remove(id: string) {
    return `This action removes a #${id} reserva`;
  }
}
