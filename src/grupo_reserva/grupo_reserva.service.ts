import { Injectable } from '@nestjs/common';
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
