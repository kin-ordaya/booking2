import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DeclaracionJuradaService } from './declaracion_jurada.service';
import { CreateDeclaracionJuradaDto } from './dto/create-declaracion_jurada.dto';
import { UpdateDeclaracionJuradaDto } from './dto/update-declaracion_jurada.dto';
import { PaginationDeclaracionJuradaDto } from './dto/pagination-declaracion_jurada.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('declaracion-jurada')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class DeclaracionJuradaController {
  constructor(private readonly declaracionJuradaService: DeclaracionJuradaService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  create(@Body() createDeclaracionJuradaDto: CreateDeclaracionJuradaDto) {
    return this.declaracionJuradaService.create(createDeclaracionJuradaDto);
  }

  @Get()
  @Roles('ADMINISTRADOR','DOCENTE')
  findAll(@Query() getDeclaracionJuradaDto: PaginationDeclaracionJuradaDto) {
    return this.declaracionJuradaService.findAll(getDeclaracionJuradaDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.declaracionJuradaService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updateDeclaracionJuradaDto: UpdateDeclaracionJuradaDto) {
    return this.declaracionJuradaService.update(+id, updateDeclaracionJuradaDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.declaracionJuradaService.remove(+id);
  }
}
