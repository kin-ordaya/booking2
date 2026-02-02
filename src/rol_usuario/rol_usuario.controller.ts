import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { RolUsuarioService } from './rol_usuario.service';
import { CreateRolUsuarioDto } from './dto/create-rol_usuario.dto';
import { UpdateRolUsuarioDto } from './dto/update-rol_usuario.dto';
import { PaginationRolUsuarioDto } from './dto/rol_usuario-pagination.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('rol-usuario')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RolUsuarioController {
  constructor(private readonly rolUsuarioService: RolUsuarioService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear rol usuario',
    description:
      'Crear un rol usuario del sistema con sus datos de creación.',
  })
  create(@Body() createRolUsuarioDto: CreateRolUsuarioDto) {
    return this.rolUsuarioService.create(createRolUsuarioDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los rol usuarios',
    description: 'Obtener todos los rol usuarios del sistema.',
  })
  findAll(@Query() paginationRolUsuarioDto: PaginationRolUsuarioDto) {
    return this.rolUsuarioService.findAll(paginationRolUsuarioDto);
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Obtener un rol usuario',
    description: 'Obtener un rol usuario del sistema por su ID.',
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rolUsuarioService.findOne(id);
  }

  @Get('recurso/:recurso_id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los docentes de un recurso',
    description: 'Obtener todos los docentes de un recurso del sistema.',
  })
  async getDocentesByRecurso(
    @Param('recurso_id', new ParseUUIDPipe()) recurso_id: string,
  ) {
    return this.rolUsuarioService.getDocentesByRecurso(recurso_id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un rol usuario',
    description:
      'Actualizar un rol usuario del sistema por su ID y datos de actualización.',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateRolUsuarioDto: UpdateRolUsuarioDto,
  ) {
    return this.rolUsuarioService.update(id, updateRolUsuarioDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un rol usuario',
    description: 'Eliminar un rol usuario del sistema por su ID.',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rolUsuarioService.remove(id);
  }
}
