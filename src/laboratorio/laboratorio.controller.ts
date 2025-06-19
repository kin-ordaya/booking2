import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LaboratorioService } from './laboratorio.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';

@Controller('laboratorio')
export class LaboratorioController {
  constructor(private readonly laboratorioService: LaboratorioService) {}

  @Post()
  create(@Body() createLaboratorioDto: CreateLaboratorioDto) {
    return this.laboratorioService.create(createLaboratorioDto);
  }

  @Get()
  findAll() {
    return this.laboratorioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laboratorioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLaboratorioDto: UpdateLaboratorioDto) {
    return this.laboratorioService.update(id, updateLaboratorioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laboratorioService.remove(id);
  }
}
