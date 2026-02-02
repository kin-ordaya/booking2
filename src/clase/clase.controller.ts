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
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('clase')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ClaseController {
  constructor(private readonly claseService: ClaseService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear clase',
    description:
      'Crear una clase fisica del sistema con sus datos de creación.',
  })
  create(@Body() createClaseDto: CreateClaseDto) {
    return this.claseService.create(createClaseDto);
  }

  @Get('recurso-docente')
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Obtener clases de un recurso docente',
    description:
      'Obtener clases de un recurso docente del sistema por su ID.',
  })
  async getClasesByRecursoDocente(
    @Query() recursoDocenteClaseDto: RecursoDocenteClaseDto,
  ) {
    return this.claseService.getClasesByRecursoDocente(recursoDocenteClaseDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todas las clases',
    description: 'Obtener todas las clases del sistema.',
  })
  findAll() {
    return this.claseService.findAll();
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener una clase',
    description: 'Obtener una clase del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.claseService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar una clase',
    description:
      'Actualizar una clase del sistema por su ID y datos de actualización.',
  })
  update(@Param('id') id: string, @Body() updateClaseDto: UpdateClaseDto) {
    return this.claseService.update(id, updateClaseDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar una clase',
    description: 'Eliminar una clase del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.claseService.remove(id);
  }
}
