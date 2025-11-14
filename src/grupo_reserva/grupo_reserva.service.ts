import { Injectable } from '@nestjs/common';
import { CreateGrupoReservaDto } from './dto/create-grupo_reserva.dto';
import { UpdateGrupoReservaDto } from './dto/update-grupo_reserva.dto';
import { GrupoReserva } from './entities/grupo_reserva.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GrupoReservaService {
  constructor(
    @InjectRepository(GrupoReserva)
    private readonly grupoReservaRepository: Repository<GrupoReserva>,
  ) {}

}
