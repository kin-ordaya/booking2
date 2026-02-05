import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RecursoCursoModalidadPeriodoService } from './recurso_curso_modalidad_periodo.service';
import { CreateRecursoCursoModalidadPeriodoDto } from './dto/create-recurso_curso_modalidad_periodo.dto';
import { UpdateRecursoCursoModalidadPeriodoDto } from './dto/update-recurso_curso_modalidad_periodo.dto';
import { GetRecursoCursoModalidadPeriodoDto } from './dto/get-recurso_curso_modalidad_periodo.dto';

@Controller('recurso-curso-modalidad-periodo')
export class RecursoCursoModalidadPeriodoController {
  constructor(
    private readonly recursoCursoModalidadPeriodoService: RecursoCursoModalidadPeriodoService,
  ) {}

  @Post()
  create(
    @Body()
    createRecursoCursoModalidadPeriodoDto: CreateRecursoCursoModalidadPeriodoDto,
  ) {
    return this.recursoCursoModalidadPeriodoService.create(
      createRecursoCursoModalidadPeriodoDto,
    );
  }

  @Get()
  findAll(
    @Query()
    getRecursoCursoModalidadPeriodoDto: GetRecursoCursoModalidadPeriodoDto,
  ) {
    return this.recursoCursoModalidadPeriodoService.findAll(
      getRecursoCursoModalidadPeriodoDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recursoCursoModalidadPeriodoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateRecursoCursoModalidadPeriodoDto: UpdateRecursoCursoModalidadPeriodoDto,
  ) {
    return this.recursoCursoModalidadPeriodoService.update(
      id,
      updateRecursoCursoModalidadPeriodoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recursoCursoModalidadPeriodoService.remove(id);
  }
}
