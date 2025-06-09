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
} from '@nestjs/common';
import { RecursoService } from './recurso.service';
import { CreateRecursoDto } from './dto/create-recurso.dto';
import { UpdateRecursoDto } from './dto/update-recurso.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { PaginationRecursoDto } from './dto/pagination-recurso.dto';

@Controller('recurso')
export class RecursoController {
  constructor(private readonly recursoService: RecursoService) {}

  @Post()
  create(@Body() createRecursoDto: CreateRecursoDto) {
    return this.recursoService.create(createRecursoDto);
  }

  @Get()
  findAll(@Query() paginationRecursoDto: PaginationRecursoDto) {
    return this.recursoService.findAll(paginationRecursoDto);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.recursoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateRecursoDto: UpdateRecursoDto,
  ) {
    return this.recursoService.update(id, updateRecursoDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.recursoService.remove(id);
  }
}
