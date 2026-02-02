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
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('recurso')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RecursoController {
  constructor(private readonly recursoService: RecursoService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear recurso',
    description: 'Crear un recurso del sistema con sus datos de creación.',
  })
  create(@Body() createRecursoDto: CreateRecursoDto) {
    return this.recursoService.create(createRecursoDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Obtener todos los recursos',
    description: 'Obtener todos los recursos del sistema.',
  })
  findAll(@Query() paginationRecursoDto: PaginationRecursoDto) {
    return this.recursoService.findAll(paginationRecursoDto);
  }

  // @Get('docente/:id')
  // async getByDocente(@Param('id', new ParseUUIDPipe()) rol_usuario_id: string) {
  //   return this.recursoService.getRecursosByDocente(rol_usuario_id);
  // }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'DOCENTE')
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
