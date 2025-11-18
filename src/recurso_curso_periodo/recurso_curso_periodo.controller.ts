import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecursoCursoPeriodoService } from './recurso_curso_periodo.service';
import { CreateRecursoCursoPeriodoDto } from './dto/create-recurso_curso_periodo.dto';
import { UpdateRecursoCursoPeriodoDto } from './dto/update-recurso_curso_periodo.dto';

@Controller('recurso-curso-periodo')
export class RecursoCursoPeriodoController {
  constructor(private readonly recursoCursoPeriodoService: RecursoCursoPeriodoService) {}

  @Post()
  create(@Body() createRecursoCursoPeriodoDto: CreateRecursoCursoPeriodoDto) {
    return this.recursoCursoPeriodoService.create(createRecursoCursoPeriodoDto);
  }

  @Get()
  findAll() {
    return this.recursoCursoPeriodoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recursoCursoPeriodoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecursoCursoPeriodoDto: UpdateRecursoCursoPeriodoDto) {
    return this.recursoCursoPeriodoService.update(+id, updateRecursoCursoPeriodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recursoCursoPeriodoService.remove(+id);
  }
}
