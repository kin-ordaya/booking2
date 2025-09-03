import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LaboratorioService } from './laboratorio.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('laboratorio')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class LaboratorioController {
  constructor(private readonly laboratorioService: LaboratorioService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createLaboratorioDto: CreateLaboratorioDto) {
    return this.laboratorioService.create(createLaboratorioDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.laboratorioService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.laboratorioService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updateLaboratorioDto: UpdateLaboratorioDto) {
    return this.laboratorioService.update(id, updateLaboratorioDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.laboratorioService.remove(id);
  }
}
