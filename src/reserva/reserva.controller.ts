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
import { CreateReservaMantenimientoGeneralDto } from './dto/create-reserva-mantenimiento-general.dto';
import { PaginationReservaDto } from './dto/pagination-reserva.dto';
import { CredencialesDisponiblesDto } from './dto/credenciales-disponibles-reserva.dto';
import { PaginationReservaInRangeDto } from './dto/pagination-reserva-in-range.dto';
import { ApiBody } from '@nestjs/swagger';
import { CreateReservaMixtoDto } from './dto/create-reserva-mixto.dto';
import { CreateReservaMantenimientoMixtoDto } from './dto/create-reserva-mantenimiento-mixto.dto';

@Controller('reserva')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post('mantenimiento-general')
  @ApiBody({ type: CreateReservaMantenimientoGeneralDto })
  createReservaMantenimiento(
    @Body()
    createReservaMantenimientoGeneralDto: CreateReservaMantenimientoGeneralDto,
  ) {
    return this.reservaService.createReservaMantenimientoGeneral(
      createReservaMantenimientoGeneralDto,
    );
  }

  @Post('mantenimiento-mixto')
  @ApiBody({ type: CreateReservaMantenimientoMixtoDto })
  createReservaMantenimientoMixto(
    @Body()
    createReservaMantenimientoMixtoDto: CreateReservaMantenimientoMixtoDto,
  ) {
    return this.reservaService.createReservaMantenimientoMixto(
      createReservaMantenimientoMixtoDto,
    );
  }

  @Post('general')
  @ApiBody({ type: CreateReservaGeneralDto })
  CreateReservaGeneral(
    @Body() createReservaGeneralDto: CreateReservaGeneralDto,
  ) {
    return this.reservaService.createReservaGeneral(createReservaGeneralDto);
  }

  @Post('mixto')
  @ApiBody({ type: CreateReservaMixtoDto })
  CreateReservaDocenteEstudiante(
    @Body() createReservaMixtoDto: CreateReservaMixtoDto,
  ) {
    return this.reservaService.createReservaMixto(createReservaMixtoDto);
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
