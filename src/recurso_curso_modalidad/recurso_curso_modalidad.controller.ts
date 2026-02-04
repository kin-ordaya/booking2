import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecursoCursoModalidadService } from './recurso_curso_modalidad.service';
import { CreateRecursoCursoModalidadDto } from './dto/create-recurso_curso_modalidad.dto';
import { UpdateRecursoCursoModalidadDto } from './dto/update-recurso_curso_modalidad.dto';

@Controller('recurso-curso-modalidad')
export class RecursoCursoModalidadController {
  constructor(private readonly recursoCursoModalidadService: RecursoCursoModalidadService) {}

  @Post()
  create(@Body() createRecursoCursoModalidadDto: CreateRecursoCursoModalidadDto) {
    return this.recursoCursoModalidadService.create(createRecursoCursoModalidadDto);
  }

  @Get()
  findAll() {
    return this.recursoCursoModalidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recursoCursoModalidadService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecursoCursoModalidadDto: UpdateRecursoCursoModalidadDto) {
    return this.recursoCursoModalidadService.update(+id, updateRecursoCursoModalidadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recursoCursoModalidadService.remove(+id);
  }
}
