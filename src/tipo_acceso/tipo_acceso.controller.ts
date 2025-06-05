import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TipoAccesoService } from './tipo_acceso.service';
import { CreateTipoAccesoDto } from './dto/create-tipo_acceso.dto';
import { UpdateTipoAccesoDto } from './dto/update-tipo_acceso.dto';

@Controller('tipo-acceso')
export class TipoAccesoController {
  constructor(private readonly tipoAccesoService: TipoAccesoService) {}

  @Post()
  create(@Body() createTipoAccesoDto: CreateTipoAccesoDto) {
    return this.tipoAccesoService.create(createTipoAccesoDto);
  }

  @Get()
  findAll() {
    return this.tipoAccesoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoAccesoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTipoAccesoDto: UpdateTipoAccesoDto,
  ) {
    return this.tipoAccesoService.update(id, updateTipoAccesoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoAccesoService.remove(id);
  }
}
