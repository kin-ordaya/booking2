import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LaboratorioAulaService } from './laboratorio_aula.service';
import { CreateLaboratorioAulaDto } from './dto/create-laboratorio_aula.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('laboratorio-aula')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class LaboratorioAulaController {
  constructor(
    private readonly laboratorioAulaService: LaboratorioAulaService,
  ) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear laboratorio aula',
    description:
      'Crear un laboratorio aula del sistema con sus datos de creación.',
  })
  create(@Body() createLaboratorioAulaDto: CreateLaboratorioAulaDto) {
    return this.laboratorioAulaService.create(createLaboratorioAulaDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los laboratorio aulas',
    description: 'Obtener todos los laboratorio aulas del sistema.',
  })
  findAll() {
    return this.laboratorioAulaService.findAll();
  }
}
