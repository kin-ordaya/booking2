import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MatriculaClaseService } from './matricula_clase.service';
import { CreateMatriculaClaseDto } from './dto/create-matricula_clase.dto';
import { UpdateMatriculaClaseDto } from './dto/update-matricula_clase.dto';

@Controller('matricula-clase')
export class MatriculaClaseController {
  constructor(private readonly matriculaClaseService: MatriculaClaseService) {}

  @Post()
  create(@Body() createMatriculaClaseDto: CreateMatriculaClaseDto) {
    return this.matriculaClaseService.create(createMatriculaClaseDto);
  }

  @Get()
  findAll() {
    return this.matriculaClaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matriculaClaseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMatriculaClaseDto: UpdateMatriculaClaseDto) {
    return this.matriculaClaseService.update(+id, updateMatriculaClaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matriculaClaseService.remove(+id);
  }
}
