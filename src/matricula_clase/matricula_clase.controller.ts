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
import { MatriculaClaseService } from './matricula_clase.service';
import { CreateMatriculaClaseDto } from './dto/create-matricula_clase.dto';
import { UpdateMatriculaClaseDto } from './dto/update-matricula_clase.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('matricula-clase')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class MatriculaClaseController {
  constructor(private readonly matriculaClaseService: MatriculaClaseService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createMatriculaClaseDto: CreateMatriculaClaseDto) {
    return this.matriculaClaseService.create(createMatriculaClaseDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.matriculaClaseService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.matriculaClaseService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id') id: string,
    @Body() updateMatriculaClaseDto: UpdateMatriculaClaseDto,
  ) {
    return this.matriculaClaseService.update(+id, updateMatriculaClaseDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.matriculaClaseService.remove(+id);
  }
}
