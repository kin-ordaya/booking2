import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('rol')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolService.create(createRolDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.rolService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rolService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body( ) updateRolDto: UpdateRolDto) {
    return this.rolService.update(id, updateRolDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rolService.remove(id);
  }
}
