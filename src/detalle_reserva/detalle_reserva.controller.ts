import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DetalleReservaService } from './detalle_reserva.service';
import { CreateDetalleReservaDto } from './dto/create-detalle_reserva.dto';
import { UpdateDetalleReservaDto } from './dto/update-detalle_reserva.dto';
import { PaginationDetalleReservaDto } from './dto/pagination_reserva.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('detalle-reserva')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class DetalleReservaController {
  constructor(private readonly detalleReservaService: DetalleReservaService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createDetalleReservaDto: CreateDetalleReservaDto) {
    return this.detalleReservaService.create(createDetalleReservaDto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  findAll(@Query() paginationDetalleReservaDto: PaginationDetalleReservaDto) {
    return this.detalleReservaService.findAll(paginationDetalleReservaDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.detalleReservaService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updateDetalleReservaDto: UpdateDetalleReservaDto) {
    return this.detalleReservaService.update(+id, updateDetalleReservaDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.detalleReservaService.remove(+id);
  }
}
