import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RecursoCursoService } from './recurso_curso.service';
import { CreateRecursoCursoDto } from './dto/create-recurso_curso.dto';
import { UpdateRecursoCursoDto } from './dto/update-recurso_curso.dto';
import { PaginationRecursoCursoDto } from './dto/pagination-recurso_curso.dto';

@Controller('recurso-curso')
export class RecursoCursoController {
  constructor(private readonly recursoCursoService: RecursoCursoService) {}

  @Post()
  create(@Body() createRecursoCursoDto: CreateRecursoCursoDto) {
    return this.recursoCursoService.create(createRecursoCursoDto);
  }

  @Get()
  findAll(@Query() paginationRecursoCursoDto: PaginationRecursoCursoDto) {
    return this.recursoCursoService.findAll(paginationRecursoCursoDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recursoCursoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecursoCursoDto: UpdateRecursoCursoDto) {
    return this.recursoCursoService.update(id, updateRecursoCursoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recursoCursoService.remove(id);
  }
}
