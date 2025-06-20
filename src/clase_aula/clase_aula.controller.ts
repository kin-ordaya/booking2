import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClaseAulaService } from './clase_aula.service';
import { CreateClaseAulaDto } from './dto/create-clase_aula.dto';
import { UpdateClaseAulaDto } from './dto/update-clase_aula.dto';

@Controller('clase-aula')
export class ClaseAulaController {
  constructor(private readonly claseAulaService: ClaseAulaService) {}

  @Post()
  create(@Body() createClaseAulaDto: CreateClaseAulaDto) {
    return this.claseAulaService.create(createClaseAulaDto);
  }

  @Get()
  findAll() {
    return this.claseAulaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.claseAulaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClaseAulaDto: UpdateClaseAulaDto) {
    return this.claseAulaService.update(+id, updateClaseAulaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.claseAulaService.remove(+id);
  }
}
