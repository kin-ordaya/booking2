import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CursoModalidadService } from './curso_modalidad.service';
import { CreateCursoModalidadDto } from './dto/create-curso_modalidad.dto';
import { UpdateCursoModalidadDto } from './dto/update-curso_modalidad.dto';
import { PaginationCursoModalidadDto } from './dto/pagination-curso_modalidad.dto';

@Controller('curso-modalidad')
export class CursoModalidadController {
  constructor(private readonly cursoModalidadService: CursoModalidadService) {}

  @Post()
  create(@Body() createCursoModalidadDto: CreateCursoModalidadDto) {
    return this.cursoModalidadService.create(createCursoModalidadDto);
  }

  @Get()
  findAll(@Query() paginationCursoModalidadDto: PaginationCursoModalidadDto) {
    return this.cursoModalidadService.findAll(paginationCursoModalidadDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cursoModalidadService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCursoModalidadDto: UpdateCursoModalidadDto,
  ) {
    return this.cursoModalidadService.update(id, updateCursoModalidadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cursoModalidadService.remove(id);
  }
}
