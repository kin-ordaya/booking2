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
import { RecursoService } from './recurso.service';
import { CreateRecursoDto } from './dto/create-recurso.dto';
import { UpdateRecursoDto } from './dto/update-recurso.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { PaginationRecursoDto } from './dto/pagination-recurso.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('recurso')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RecursoController {
  constructor(private readonly recursoService: RecursoService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createRecursoDto: CreateRecursoDto) {
    return this.recursoService.create(createRecursoDto);
  }

  @Get()
  @Roles('ADMINISTRADOR','DOCENTE')
  findAll(@Query() paginationRecursoDto: PaginationRecursoDto) {
    return this.recursoService.findAll(paginationRecursoDto);
  }

  // @Get('docente/:id')
  // async getByDocente(@Param('id', new ParseUUIDPipe()) rol_usuario_id: string) {
  //   return this.recursoService.getRecursosByDocente(rol_usuario_id);
  // }

  @Get(':id')
  @Roles('ADMINISTRADOR','DOCENTE')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.recursoService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateRecursoDto: UpdateRecursoDto,
  ) {
    return this.recursoService.update(id, updateRecursoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.recursoService.remove(id);
  }
}
