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
import { HorarioService } from './horario.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('horario')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class HorarioController {
  constructor(private readonly horarioService: HorarioService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createHorarioDto: CreateHorarioDto) {
    return this.horarioService.create(createHorarioDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.horarioService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.horarioService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updateHorarioDto: UpdateHorarioDto) {
    return this.horarioService.update(+id, updateHorarioDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.horarioService.remove(+id);
  }
}
