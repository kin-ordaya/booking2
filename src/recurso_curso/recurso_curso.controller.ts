import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecursoCursoService } from './recurso_curso.service';
import { CreateRecursoCursoDto } from './dto/create-recurso_curso.dto';
import { UpdateRecursoCursoDto } from './dto/update-recurso_curso.dto';
import { PaginationRecursoCursoDto } from './dto/pagination-recurso_curso.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('recurso-curso')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RecursoCursoController {
  constructor(private readonly recursoCursoService: RecursoCursoService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createRecursoCursoDto: CreateRecursoCursoDto) {
    return this.recursoCursoService.create(createRecursoCursoDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll(@Query() paginationRecursoCursoDto: PaginationRecursoCursoDto) {
    return this.recursoCursoService.findAll(paginationRecursoCursoDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.recursoCursoService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id') id: string,
    @Body() updateRecursoCursoDto: UpdateRecursoCursoDto,
  ) {
    return this.recursoCursoService.update(id, updateRecursoCursoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.recursoCursoService.remove(id);
  }
}
