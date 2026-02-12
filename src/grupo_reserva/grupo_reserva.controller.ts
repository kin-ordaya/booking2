import {
  Controller,
} from '@nestjs/common';
import { GrupoReservaService } from './grupo_reserva.service';

@Controller('grupo-reserva')
export class GrupoReservaController {
  constructor(private readonly grupoReservaService: GrupoReservaService) {}
}
