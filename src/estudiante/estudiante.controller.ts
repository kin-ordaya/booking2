import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createEstudianteDto: CreateEstudianteDto) {
    return this.estudianteService.create(createEstudianteDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.estudianteService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.estudianteService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updateEstudianteDto: UpdateEstudianteDto) {
    return this.estudianteService.update(+id, updateEstudianteDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.estudianteService.remove(+id);
  }
}
