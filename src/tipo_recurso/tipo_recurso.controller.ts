import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TipoRecursoService } from './tipo_recurso.service';
import { CreateTipoRecursoDto } from './dto/create-tipo_recurso.dto';
import { UpdateTipoRecursoDto } from './dto/update-tipo_recurso.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';

@Controller('tipo-recurso')
export class TipoRecursoController {
  constructor(private readonly tipoRecursoService: TipoRecursoService) {}

  @Post()
  create(@Body() createTipoRecursoDto: CreateTipoRecursoDto) {
    return this.tipoRecursoService.create(createTipoRecursoDto);
  }

  @Get()
  findAll() {
    return this.tipoRecursoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tipoRecursoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateTipoRecursoDto: UpdateTipoRecursoDto,
  ) {
    return this.tipoRecursoService.update(id, updateTipoRecursoDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tipoRecursoService.remove(id);
  }
}
