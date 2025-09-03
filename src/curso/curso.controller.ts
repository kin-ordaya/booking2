import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CursoService } from './curso.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { PaginationCursoDto } from './dto/pagination.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('curso')
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createCursoDto: CreateCursoDto) {
    return this.cursoService.create(createCursoDto);
  }

  // @Get('recurso-docente')
  // async getCursosByRecursoDocente(
  //   @Query() recursoDocenteCursoDto: RecursoDocenteCursoDto,
  // ) {
  //   return this.cursoService.getCursosByRecursoDocente(
  //     recursoDocenteCursoDto
  //   );
  // }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll(@Query() paginationCursoDto: PaginationCursoDto) {
    return this.cursoService.findAll(paginationCursoDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cursoService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateCursoDto: UpdateCursoDto,
  ) {
    return this.cursoService.update(id, updateCursoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cursoService.remove(id);
  }
}
