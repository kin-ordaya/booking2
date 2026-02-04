import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RecursoCursoModalidadService } from './recurso_curso_modalidad.service';
import { CreateRecursoCursoModalidadDto } from './dto/create-recurso_curso_modalidad.dto';
import { UpdateRecursoCursoModalidadDto } from './dto/update-recurso_curso_modalidad.dto';
import { PaginationRecursoCursoModalidadDto } from './dto/pagination-recurso_curso_modalidad.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/guard/auth.guard';
import { RolesGuard } from '@/auth/guard/roles.guard';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('recurso-curso-modalidad')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RecursoCursoModalidadController {
  constructor(private readonly recursoCursoModalidadService: RecursoCursoModalidadService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear recurso curso modalidad',
    description:
      'Crear un recurso curso modalidad del sistema con sus datos de creación.',
  })
  create(@Body() createRecursoCursoModalidadDto: CreateRecursoCursoModalidadDto) {
    return this.recursoCursoModalidadService.create(createRecursoCursoModalidadDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los recursos curso modalidad',
    description: 'Obtener todos los recursos curso modalidad del sistema.',
  })
  findAll(@Query() paginationRecursoCursoModalidadDto: PaginationRecursoCursoModalidadDto) {
    return this.recursoCursoModalidadService.findAll(paginationRecursoCursoModalidadDto);
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un recurso curso modalidad',
    description: 'Obtener un recurso curso modalidad del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.recursoCursoModalidadService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un recurso curso modalidad',
    description:
      'Actualizar un recurso curso modalidad del sistema por su ID y datos de actualización.',
  })
  update(@Param('id') id: string, @Body() updateRecursoCursoModalidadDto: UpdateRecursoCursoModalidadDto) {
    return this.recursoCursoModalidadService.update(id, updateRecursoCursoModalidadDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un recurso curso modalidad',
    description: 'Eliminar un recurso curso modalidad del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.recursoCursoModalidadService.remove(id);
  }
}
