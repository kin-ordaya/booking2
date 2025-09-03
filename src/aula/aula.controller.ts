import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AulaService } from './aula.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('aula')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class AulaController {
  constructor(private readonly aulaService: AulaService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createAulaDto: CreateAulaDto) {
    return this.aulaService.create(createAulaDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.aulaService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.aulaService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updateAulaDto: UpdateAulaDto) {
    return this.aulaService.update(id, updateAulaDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.aulaService.remove(id);
  }
}
