import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TipoAccesoService } from './tipo_acceso.service';
import { CreateTipoAccesoDto } from './dto/create-tipo_acceso.dto';
import { UpdateTipoAccesoDto } from './dto/update-tipo_acceso.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('tipo-acceso')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class TipoAccesoController {
  constructor(private readonly tipoAccesoService: TipoAccesoService) {}

  @Post()
    @Roles('ADMINISTRADOR')
  create(@Body() createTipoAccesoDto: CreateTipoAccesoDto) {
    return this.tipoAccesoService.create(createTipoAccesoDto);
  }

  @Get()
    @Roles('ADMINISTRADOR')
  findAll() {
    return this.tipoAccesoService.findAll();
  }

  @Get(':id')
    @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.tipoAccesoService.findOne(id);
  }

  @Patch(':id')
    @Roles('ADMINISTRADOR')
  update(
    @Param('id') id: string,
    @Body() updateTipoAccesoDto: UpdateTipoAccesoDto,
  ) {
    return this.tipoAccesoService.update(id, updateTipoAccesoDto);
  }

  @Delete(':id')
    @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.tipoAccesoService.remove(id);
  }
}
