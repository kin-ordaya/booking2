import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LaboratorioAulaService } from './laboratorio_aula.service';
import { CreateLaboratorioAulaDto } from './dto/create-laboratorio_aula.dto';
import { UpdateLaboratorioAulaDto } from './dto/update-laboratorio_aula.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('laboratorio-aula')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class LaboratorioAulaController {
  constructor(
    private readonly laboratorioAulaService: LaboratorioAulaService,
  ) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createLaboratorioAulaDto: CreateLaboratorioAulaDto) {
    return this.laboratorioAulaService.create(createLaboratorioAulaDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.laboratorioAulaService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.laboratorioAulaService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id') id: string,
    @Body() updateLaboratorioAulaDto: UpdateLaboratorioAulaDto,
  ) {
    return this.laboratorioAulaService.update(+id, updateLaboratorioAulaDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.laboratorioAulaService.remove(+id);
  }
}
