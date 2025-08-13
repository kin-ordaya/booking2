import { CreateReservaGeneralDto } from './dto/create-reserva-general.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaMantenimientoDto } from './dto/create-reserva.dto';
import { PaginationReservaDto } from './dto/pagination-reserva.dto';
import { CredencialesDisponiblesDto } from './dto/credenciales-disponibles-reserva.dto';
import { PaginationReservaInRangeDto } from './dto/pagination-reserva-in-range.dto';
import { ApiBody } from '@nestjs/swagger';
import { CreateReservaMixtoDto } from './dto/create-reserva-mixto.dto';

@Controller('reserva')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post('mantenimiento')
  @ApiBody({ type: CreateReservaMantenimientoDto })
  createReservaMantenimiento(@Body() createReservaMantenimientoDto: CreateReservaMantenimientoDto) {
    return this.reservaService.createReservaMantenimiento(
      createReservaMantenimientoDto,
    );
  }

  @Post('general')
  @ApiBody({ type: CreateReservaGeneralDto })
  CreateReservaGeneral(@Body() createReservaGeneralDto: CreateReservaGeneralDto) {
    return this.reservaService.createReservaGeneral(
      createReservaGeneralDto,
    );
  }

  @Post('mixto')
  @ApiBody({ type: CreateReservaMixtoDto })
  CreateReservaDocenteEstudiante(
    @Body() createReservaMixtoDto: CreateReservaMixtoDto,
  ) {
    return this.reservaService.createReservaDocenteEstudiante(
      createReservaMixtoDto,
    );
  }

  @Get('credenciales-disponibles')
  async countCredencialesDisponibles(
    @Query() credencialesDisponiblesDto: CredencialesDisponiblesDto,
  ) {
    return this.reservaService.countCredencialesDisponibles(
      credencialesDisponiblesDto,
    );
  }

  @Get('in-range')
  findReservasInRange(
    @Query() paginationReservaInRangeDto: PaginationReservaInRangeDto,
  ) {
    return this.reservaService.findReservasInRange(paginationReservaInRangeDto);
  }

  @Get()
  findAll(@Query() paginationReservaDto: PaginationReservaDto) {
    return this.reservaService.findAll(paginationReservaDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservaService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReservaDto: UpdateReservaDto) {
  //   return this.reservaService.update(id, updateReservaDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservaService.remove(id);
  }
}
