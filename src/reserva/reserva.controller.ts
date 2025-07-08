import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { PaginationReservaDto } from './dto/pagination-reserva.dto';
import { CredencialesDisponiblesDto } from './dto/credenciales-disponibles-reserva.dto';

@Controller('reserva')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservaService.create(createReservaDto);
  }

  @Get('credenciales-disponibles')
  async countCredencialesDisponibles(
    @Query() credencialesDisponiblesDto: CredencialesDisponiblesDto,
  ) {
    return this.reservaService.countCredencialesDisponibles(
      credencialesDisponiblesDto,
    );
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
