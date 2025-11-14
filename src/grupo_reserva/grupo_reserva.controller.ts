import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GrupoReservaService } from './grupo_reserva.service';
import { CreateGrupoReservaDto } from './dto/create-grupo_reserva.dto';
import { UpdateGrupoReservaDto } from './dto/update-grupo_reserva.dto';

@Controller('grupo-reserva')
export class GrupoReservaController {
  constructor(private readonly grupoReservaService: GrupoReservaService) {}

}
