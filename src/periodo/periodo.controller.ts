import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PeriodoService } from './periodo.service';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('periodo')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class PeriodoController {
  constructor(private readonly periodoService: PeriodoService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createPeriodoDto: CreatePeriodoDto) {
    return this.periodoService.create(createPeriodoDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.periodoService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.periodoService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updatePeriodoDto: UpdatePeriodoDto) {
    return this.periodoService.update(id, updatePeriodoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.periodoService.remove(id);
  }
}
