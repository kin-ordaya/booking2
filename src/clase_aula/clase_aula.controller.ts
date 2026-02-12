import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { ClaseAulaService } from './clase_aula.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';


@Controller('clase-aula')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ClaseAulaController {
  constructor(private readonly claseAulaService: ClaseAulaService) {}
}
