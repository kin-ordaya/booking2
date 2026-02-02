import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { TipoRecursoService } from './tipo_recurso.service';
import { CreateTipoRecursoDto } from './dto/create-tipo_recurso.dto';
import { UpdateTipoRecursoDto } from './dto/update-tipo_recurso.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('tipo-recurso')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class TipoRecursoController {
  constructor(private readonly tipoRecursoService: TipoRecursoService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear tipo de recurso',
    description: 'Crear un tipo de recurso del sistema con sus datos de creación.',
  })
  create(@Body() createTipoRecursoDto: CreateTipoRecursoDto) {
    return this.tipoRecursoService.create(createTipoRecursoDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los tipos de recurso',
    description: 'Obtener todos los tipos de recurso del sistema.',
  })
  findAll() {
    return this.tipoRecursoService.findAll();
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un tipo de recurso',
    description: 'Obtener un tipo de recurso del sistema por su ID.',
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tipoRecursoService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un tipo de recurso',
    description:
      'Actualizar un tipo de recurso del sistema por su ID y datos de actualización.',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateTipoRecursoDto: UpdateTipoRecursoDto,
  ) {
    return this.tipoRecursoService.update(id, updateTipoRecursoDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un tipo de recurso',
    description: 'Eliminar un tipo de recurso del sistema por su ID.',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tipoRecursoService.remove(id);
  }
}
