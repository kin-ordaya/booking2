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
import { ModalidadService } from './modalidad.service';
import { CreateModalidadDto } from './dto/create-modalidad.dto';
import { UpdateModalidadDto } from './dto/update-modalidad.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('modalidad')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ModalidadController {
  constructor(private readonly modalidadService: ModalidadService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createModalidadDto: CreateModalidadDto) {
    return this.modalidadService.create(createModalidadDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.modalidadService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.modalidadService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateModalidadDto: UpdateModalidadDto,
  ) {
    return this.modalidadService.update(id, updateModalidadDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.modalidadService.remove(id);
  }
}
