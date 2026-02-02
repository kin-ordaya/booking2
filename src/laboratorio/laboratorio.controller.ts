import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LaboratorioService } from './laboratorio.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('laboratorio')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class LaboratorioController {
  constructor(private readonly laboratorioService: LaboratorioService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear laboratorio',
    description: 'Crear un laboratorio del sistema con sus datos de creación.',
  })
  create(@Body() createLaboratorioDto: CreateLaboratorioDto) {
    return this.laboratorioService.create(createLaboratorioDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los laboratorios',
    description: 'Obtener todos los laboratorios del sistema.',
  })
  findAll() {
    return this.laboratorioService.findAll();
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un laboratorio',
    description: 'Obtener un laboratorio del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.laboratorioService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un laboratorio',
    description:
      'Actualizar un laboratorio del sistema por su ID y datos de actualización.',
  })
  update(
    @Param('id') id: string,
    @Body() updateLaboratorioDto: UpdateLaboratorioDto,
  ) {
    return this.laboratorioService.update(id, updateLaboratorioDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un laboratorio',
    description: 'Eliminar un laboratorio del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.laboratorioService.remove(id);
  }
}
