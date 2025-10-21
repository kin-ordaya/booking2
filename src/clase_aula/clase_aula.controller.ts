import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClaseAulaService } from './clase_aula.service';
import { CreateClaseAulaDto } from './dto/create-clase_aula.dto';
import { UpdateClaseAulaDto } from './dto/update-clase_aula.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('clase-aula')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ClaseAulaController {
  constructor(private readonly claseAulaService: ClaseAulaService) {}

  // @Post()
  // @Roles('ADMINISTRADOR')
  // create(@Body() createClaseAulaDto: CreateClaseAulaDto) {
  //   return this.claseAulaService.create(createClaseAulaDto);
  // }

  // @Get()
  // @Roles('ADMINISTRADOR')
  // findAll() {
  //   return this.claseAulaService.findAll();
  // }

  // @Get(':id')
  // @Roles('ADMINISTRADOR')
  // findOne(@Param('id') id: string) {
  //   return this.claseAulaService.findOne(+id);
  // }

  // @Patch(':id')
  // @Roles('ADMINISTRADOR')
  // update(@Param('id') id: string, @Body() updateClaseAulaDto: UpdateClaseAulaDto) {
  //   return this.claseAulaService.update(+id, updateClaseAulaDto);
  // }

  // @Delete(':id')
  // @Roles('ADMINISTRADOR')
  // remove(@Param('id') id: string) {
  //   return this.claseAulaService.remove(+id);
  // }
}
