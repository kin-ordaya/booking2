import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

}
