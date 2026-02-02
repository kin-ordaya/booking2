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
import { PeriodoService } from './periodo.service';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('periodo')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class PeriodoController {
  constructor(private readonly periodoService: PeriodoService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear periodo',
    description: 'Crear un periodo del sistema con sus datos de creación.',
  })
  create(@Body() createPeriodoDto: CreatePeriodoDto) {
    return this.periodoService.create(createPeriodoDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los periodos',
    description: 'Obtener todos los periodos del sistema.',
  })
  findAll() {
    return this.periodoService.findAll();
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un periodo',
    description: 'Obtener un periodo del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.periodoService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un periodo',
    description:
      'Actualizar un periodo del sistema por su ID y datos de actualización.',
  })
  update(@Param('id') id: string, @Body() updatePeriodoDto: UpdatePeriodoDto) {
    return this.periodoService.update(id, updatePeriodoDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un periodo',
    description: 'Eliminar un periodo del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.periodoService.remove(id);
  }
}
