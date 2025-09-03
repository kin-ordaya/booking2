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
import { CursoModalidadService } from './curso_modalidad.service';
import { CreateCursoModalidadDto } from './dto/create-curso_modalidad.dto';
import { UpdateCursoModalidadDto } from './dto/update-curso_modalidad.dto';
import { PaginationCursoModalidadDto } from './dto/pagination-curso_modalidad.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('curso-modalidad')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class CursoModalidadController {
  constructor(private readonly cursoModalidadService: CursoModalidadService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createCursoModalidadDto: CreateCursoModalidadDto) {
    return this.cursoModalidadService.create(createCursoModalidadDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll(@Query() paginationCursoModalidadDto: PaginationCursoModalidadDto) {
    return this.cursoModalidadService.findAll(paginationCursoModalidadDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.cursoModalidadService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id') id: string,
    @Body(new AtLeastOneFieldPipe()) updateCursoModalidadDto: UpdateCursoModalidadDto,
  ) {
    return this.cursoModalidadService.update(id, updateCursoModalidadDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.cursoModalidadService.remove(id);
  }
}
