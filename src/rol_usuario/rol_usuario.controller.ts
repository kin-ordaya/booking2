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
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('rol-usuario')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RolUsuarioController {
  constructor(private readonly rolUsuarioService: RolUsuarioService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createRolUsuarioDto: CreateRolUsuarioDto) {
    return this.rolUsuarioService.create(createRolUsuarioDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll(@Query() paginationRolUsuarioDto: PaginationRolUsuarioDto) {
    return this.rolUsuarioService.findAll(paginationRolUsuarioDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'DOCENTE')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rolUsuarioService.findOne(id);
  }

  @Get('recurso/:recurso_id')
  @Roles('ADMINISTRADOR')
  async getDocentesByRecurso(
    @Param('recurso_id', new ParseUUIDPipe()) recurso_id: string,
  ) {
    return this.rolUsuarioService.getDocentesByRecurso(recurso_id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateRolUsuarioDto: UpdateRolUsuarioDto,
  ) {
    return this.rolUsuarioService.update(id, updateRolUsuarioDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rolUsuarioService.remove(id);
  }
}
