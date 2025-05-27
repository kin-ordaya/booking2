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
import { CursoService } from './curso.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { PaginationCursoDto } from './dto/pagination.dto';

@Controller('curso')
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Post()
  create(@Body() createCursoDto: CreateCursoDto) {
    return this.cursoService.create(createCursoDto);
  }

  @Get()
  findAll(@Query() paginationCursoDto: PaginationCursoDto) {
    return this.cursoService.findAll(paginationCursoDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cursoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCursoDto: UpdateCursoDto) {
    return this.cursoService.update(id, updateCursoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cursoService.remove(id);
  }
}
