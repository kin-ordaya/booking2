import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RecursoCursoPeriodoService } from './recurso_curso_periodo.service';
import { CreateRecursoCursoPeriodoDto } from './dto/create-recurso_curso_periodo.dto';
import { GetRecursoCursoPeriodoDto } from './dto/get-recurso_curso_periodo.dto';

@Controller('recurso-curso-periodo')
export class RecursoCursoPeriodoController {
  constructor(
    private readonly recursoCursoPeriodoService: RecursoCursoPeriodoService,
  ) {}

  @Post()
  create(@Body() createRecursoCursoPeriodoDto: CreateRecursoCursoPeriodoDto) {
    return this.recursoCursoPeriodoService.create(createRecursoCursoPeriodoDto);
  }

  @Get()
  findAll(@Query() getRecursoCursoPeriodoDto: GetRecursoCursoPeriodoDto) {
    return this.recursoCursoPeriodoService.findAll(getRecursoCursoPeriodoDto);
  }
}
