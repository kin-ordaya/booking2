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
import { TipoAccesoService } from './tipo_acceso.service';
import { CreateTipoAccesoDto } from './dto/create-tipo_acceso.dto';
import { UpdateTipoAccesoDto } from './dto/update-tipo_acceso.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('tipo-acceso')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class TipoAccesoController {
  constructor(private readonly tipoAccesoService: TipoAccesoService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear un nuevo tipo de acceso',
    description: 'Crear un nuevo tipo de acceso.',
  })
  create(@Body() createTipoAccesoDto: CreateTipoAccesoDto) {
    return this.tipoAccesoService.create(createTipoAccesoDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los tipos de acceso',
    description: 'Obtener todos los tipos de acceso.',
  })
  findAll() {
    return this.tipoAccesoService.findAll();
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un tipo de acceso',
    description: 'Obtener un tipo de acceso.',
  })
  findOne(@Param('id') id: string) {
    return this.tipoAccesoService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un tipo de acceso',
    description: 'Actualizar un tipo de acceso.',
  })
  update(
    @Param('id') id: string,
    @Body() updateTipoAccesoDto: UpdateTipoAccesoDto,
  ) {
    return this.tipoAccesoService.update(id, updateTipoAccesoDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un tipo de acceso',
    description: 'Eliminar un tipo de acceso.',
  })
  remove(@Param('id') id: string) {
    return this.tipoAccesoService.remove(id);
  }
}
