import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { TipoRecursoService } from './tipo_recurso.service';
import { CreateTipoRecursoDto } from './dto/create-tipo_recurso.dto';
import { UpdateTipoRecursoDto } from './dto/update-tipo_recurso.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('tipo-recurso')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class TipoRecursoController {
  constructor(private readonly tipoRecursoService: TipoRecursoService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createTipoRecursoDto: CreateTipoRecursoDto) {
    return this.tipoRecursoService.create(createTipoRecursoDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.tipoRecursoService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tipoRecursoService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateTipoRecursoDto: UpdateTipoRecursoDto,
  ) {
    return this.tipoRecursoService.update(id, updateTipoRecursoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tipoRecursoService.remove(id);
  }
}
