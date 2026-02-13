import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { HorarioService } from './horario.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('horario')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class HorarioController {
  constructor(private readonly horarioService: HorarioService) {}

}
