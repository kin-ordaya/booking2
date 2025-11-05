import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaMantenimientoGeneralDto } from './dto/individual/create-reserva-mantenimiento-general.dto';
import { PaginationReservaDto } from './dto/pagination-reserva.dto';
import { CredencialesDisponiblesDto } from './dto/credenciales-disponibles-reserva.dto';
import { PaginationReservaInRangeDto } from './dto/pagination-reserva-in-range.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateReservaMixtoDto } from './dto/individual/create-reserva-mixto.dto';
import { CreateReservaMantenimientoMixtoDto } from './dto/individual/create-reserva-mantenimiento-mixto.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateReservaGeneralMultipleDto } from './dto/multiple/create-reserva-general-multiple.dto';
import { CreateReservaGeneralDto } from './dto/individual/create-reserva-general.dto';
import { CreateReservaMantenimientoGeneralMultipleDto } from './dto/multiple/create-reserva-mantenimiento-general-multiple.dto';
import { CreateReservaMixtoMultipleDto } from './dto/multiple/create-reserva-mixto-multiple.dto';
import { CreateReservaMantenimientoMixtoMultipleDto } from './dto/multiple/create-reserva-mantenimiento-mixto-multiple.dto';

@Controller('reserva')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post('general')
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiBody({ type: CreateReservaGeneralDto })
  CreateReservaGeneral(
    @Body() createReservaGeneralDto: CreateReservaGeneralDto,
  ) {
    //console.log(createReservaGeneralDto);
    return this.reservaService.createReservaGeneral(createReservaGeneralDto);
  }

  @Post('mixto')
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiBody({ type: CreateReservaMixtoDto })
  CreateReservaDocenteEstudiante(
    @Body() createReservaMixtoDto: CreateReservaMixtoDto,
  ) {
    //console.log(createReservaMixtoDto);
    return this.reservaService.createReservaMixto(createReservaMixtoDto);
  }

  @Post('mantenimiento-general')
  @Roles('ADMINISTRADOR')
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
  @Roles('ADMINISTRADOR')
  @ApiBody({ type: CreateReservaMantenimientoMixtoDto })
  createReservaMantenimientoMixto(
    @Body()
    createReservaMantenimientoMixtoDto: CreateReservaMantenimientoMixtoDto,
  ) {
    return this.reservaService.createReservaMantenimientoMixto(
      createReservaMantenimientoMixtoDto,
    );
  }

  @Post('general-multiple')
  @Roles('ADMINISTRADOR')
  createReservaGeneralMultiple(
    @Body()
    createReservaGeneralMultipleDto: CreateReservaGeneralMultipleDto,
  ) {
    return this.reservaService.createReservaGeneralMultiple(
      createReservaGeneralMultipleDto,
    );
  }

  @Post('mixto-multiple')
  @Roles('ADMINISTRADOR')
  createReservaMixtoMultiple(
    @Body()
    createReservaMixtoMultipleDto: CreateReservaMixtoMultipleDto,
  ) {
    return 'Mantenimiento mixto multiple';
  }

  @Post('mantenimiento-general-multiple')
  @Roles('ADMINISTRADOR')
  createReservaMantenimientoGeneralMultiple(
    @Body()
    createReservaMantenimientoGeneralMultipleDto: CreateReservaMantenimientoGeneralMultipleDto,
  ) {
    return 'Mantenimiento mantenimiento general multiple';
  }

  @Post('mantenimiento-mixto-multiple')
  @Roles('ADMINISTRADOR')
  createReservaMantenimientoMixtoMultiple(
    @Body()
    createReservaMantenimientoMixtoMultipleDto: CreateReservaMantenimientoMixtoMultipleDto,
  ) {
    return 'Mantenimiento mantenimiento mixto multiple';
  }

  @Get('credenciales-disponibles')
  @Roles('ADMINISTRADOR', 'DOCENTE')
  async countCredencialesDisponibles(
    @Query() credencialesDisponiblesDto: CredencialesDisponiblesDto,
  ) {
    return this.reservaService.countCredencialesDisponibles(
      credencialesDisponiblesDto,
    );
  }

  @Get('in-range')
  @Roles('ADMINISTRADOR', 'DOCENTE')
  findReservasInRange(
    @Query() paginationReservaInRangeDto: PaginationReservaInRangeDto,
  ) {
    return this.reservaService.findReservasInRange(paginationReservaInRangeDto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  findAll(@Query() paginationReservaDto: PaginationReservaDto) {
    return this.reservaService.findAll(paginationReservaDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'DOCENTE')
  findOne(@Param('id') id: string) {
    return this.reservaService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReservaDto: UpdateReservaDto) {
  //   return this.reservaService.update(id, updateReservaDto);
  // }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.reservaService.remove(id);
  }
}
