import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LaboratorioAulaService } from './laboratorio_aula.service';
import { CreateLaboratorioAulaDto } from './dto/create-laboratorio_aula.dto';
import { UpdateLaboratorioAulaDto } from './dto/update-laboratorio_aula.dto';

@Controller('laboratorio-aula')
export class LaboratorioAulaController {
  constructor(private readonly laboratorioAulaService: LaboratorioAulaService) {}

  @Post()
  create(@Body() createLaboratorioAulaDto: CreateLaboratorioAulaDto) {
    return this.laboratorioAulaService.create(createLaboratorioAulaDto);
  }

  @Get()
  findAll() {
    return this.laboratorioAulaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laboratorioAulaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLaboratorioAulaDto: UpdateLaboratorioAulaDto) {
    return this.laboratorioAulaService.update(+id, updateLaboratorioAulaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laboratorioAulaService.remove(+id);
  }
}
