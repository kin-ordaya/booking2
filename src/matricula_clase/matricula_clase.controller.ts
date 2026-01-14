import { Controller, UseGuards } from '@nestjs/common';
import { MatriculaClaseService } from './matricula_clase.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('matricula-clase')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class MatriculaClaseController {
  constructor(private readonly matriculaClaseService: MatriculaClaseService) {}
}
