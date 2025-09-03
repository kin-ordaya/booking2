import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('usuario')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usuarioService.findAll(paginationDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
