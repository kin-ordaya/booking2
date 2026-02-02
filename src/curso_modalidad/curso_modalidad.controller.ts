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
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('curso-modalidad')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class CursoModalidadController {
  constructor(private readonly cursoModalidadService: CursoModalidadService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear curso modalidad',
    description:
      'Crear un curso modalidad del sistema con sus datos de creación.',
  })
  create(@Body() createCursoModalidadDto: CreateCursoModalidadDto) {
    return this.cursoModalidadService.create(createCursoModalidadDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los curso modalidades',
    description: 'Obtener todos los curso modalidades del sistema.',
  })
  findAll(@Query() paginationCursoModalidadDto: PaginationCursoModalidadDto) {
    return this.cursoModalidadService.findAll(paginationCursoModalidadDto);
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un curso modalidad',
    description: 'Obtener un curso modalidad del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.cursoModalidadService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un curso modalidad',
    description:
      'Actualizar un curso modalidad del sistema por su ID y datos de actualización.',
  })
  update(
    @Param('id') id: string,
    @Body(new AtLeastOneFieldPipe())
    updateCursoModalidadDto: UpdateCursoModalidadDto,
  ) {
    return this.cursoModalidadService.update(id, updateCursoModalidadDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un curso modalidad',
    description: 'Eliminar un curso modalidad del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.cursoModalidadService.remove(id);
  }
}
