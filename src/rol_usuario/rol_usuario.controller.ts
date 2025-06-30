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
} from '@nestjs/common';
import { RolUsuarioService } from './rol_usuario.service';
import { CreateRolUsuarioDto } from './dto/create-rol_usuario.dto';
import { UpdateRolUsuarioDto } from './dto/update-rol_usuario.dto';
import { PaginationRolUsuarioDto } from './dto/rol_usuario-pagination.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';

@Controller('rol-usuario')
export class RolUsuarioController {
  constructor(private readonly rolUsuarioService: RolUsuarioService) {}

  @Post()
  create(@Body() createRolUsuarioDto: CreateRolUsuarioDto) {
    return this.rolUsuarioService.create(createRolUsuarioDto);
  }

  @Get()
  findAll(@Query() paginationRolUsuarioDto: PaginationRolUsuarioDto) {
    return this.rolUsuarioService.findAll(paginationRolUsuarioDto);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rolUsuarioService.findOne(id);
  }

  @Get('recurso/:id')
  async getDocentesByRecurso(@Param('id', new ParseUUIDPipe()) recurso_id: string) {
    return this.rolUsuarioService.getDocentesByRecurso(recurso_id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe) updateRolUsuarioDto: UpdateRolUsuarioDto,
  ) {
    return this.rolUsuarioService.update(id, updateRolUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rolUsuarioService.remove(id);
  }
}
