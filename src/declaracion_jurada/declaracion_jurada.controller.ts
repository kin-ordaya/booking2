import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DeclaracionJuradaService } from './declaracion_jurada.service';
import { CreateDeclaracionJuradaDto } from './dto/create-declaracion_jurada.dto';
import { UpdateDeclaracionJuradaDto } from './dto/update-declaracion_jurada.dto';
import { PaginationDeclaracionJuradaDto } from './dto/pagination-declaracion_jurada.dto';

@Controller('declaracion-jurada')
export class DeclaracionJuradaController {
  constructor(private readonly declaracionJuradaService: DeclaracionJuradaService) {}

  @Post()
  create(@Body() createDeclaracionJuradaDto: CreateDeclaracionJuradaDto) {
    return this.declaracionJuradaService.create(createDeclaracionJuradaDto);
  }

  @Get()
  findAll(@Query() getDeclaracionJuradaDto: PaginationDeclaracionJuradaDto) {
    return this.declaracionJuradaService.findAll(getDeclaracionJuradaDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.declaracionJuradaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeclaracionJuradaDto: UpdateDeclaracionJuradaDto) {
    return this.declaracionJuradaService.update(+id, updateDeclaracionJuradaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.declaracionJuradaService.remove(+id);
  }
}
