import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClaseService } from './clase.service';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { RecursoDocenteClaseDto } from './dto/recurso-docente-clase.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('clase')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ClaseController {
  constructor(private readonly claseService: ClaseService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createClaseDto: CreateClaseDto) {
    return this.claseService.create(createClaseDto);
  }

  @Get('recurso-docente')
  @Roles('ADMINISTRADOR', 'DOCENTE')
  async getClasesByRecursoDocente(
    @Query() recursoDocenteClaseDto: RecursoDocenteClaseDto,
  ) {
    return this.claseService.getClasesByRecursoDocente(recursoDocenteClaseDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.claseService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.claseService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updateClaseDto: UpdateClaseDto) {
    return this.claseService.update(id, updateClaseDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.claseService.remove(id);
  }
}
