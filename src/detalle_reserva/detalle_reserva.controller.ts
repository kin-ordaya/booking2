import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DetalleReservaService } from './detalle_reserva.service';
import { CreateDetalleReservaDto } from './dto/create-detalle_reserva.dto';
import { UpdateDetalleReservaDto } from './dto/update-detalle_reserva.dto';
import { PaginationDetalleReservaDto } from './dto/pagination_reserva.dto';

@Controller('detalle-reserva')
export class DetalleReservaController {
  constructor(private readonly detalleReservaService: DetalleReservaService) {}

  @Post()
  create(@Body() createDetalleReservaDto: CreateDetalleReservaDto) {
    return this.detalleReservaService.create(createDetalleReservaDto);
  }

  @Get()
  findAll(@Query() paginationDetalleReservaDto: PaginationDetalleReservaDto) {
    return this.detalleReservaService.findAll(paginationDetalleReservaDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleReservaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleReservaDto: UpdateDetalleReservaDto) {
    return this.detalleReservaService.update(+id, updateDetalleReservaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleReservaService.remove(+id);
  }
}
