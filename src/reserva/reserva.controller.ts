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
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
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
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('reserva')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post('general')
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Crear reserva general',
    description: 'Crear una reserva general del sistema.',
  })
  @ApiBody({ type: CreateReservaGeneralDto })
  CreateReservaGeneral(
    @Body() createReservaGeneralDto: CreateReservaGeneralDto,
  ) {
    return this.reservaService.createReservaGeneral(createReservaGeneralDto);
  }

  @Post('mixto')
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Crear reserva mixto',
    description: 'Crear una reserva mixto del sistema.',
  })
  @ApiBody({ type: CreateReservaMixtoDto })
  CreateReservaDocenteEstudiante(
    @Body() createReservaMixtoDto: CreateReservaMixtoDto,
  ) {
    return this.reservaService.createReservaMixto(createReservaMixtoDto);
  }

  @Post('mantenimiento-general')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear reserva mantenimiento general',
    description: 'Crear una reserva mantenimiento general del sistema.',
  })
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
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear reserva mantenimiento mixto',
    description: 'Crear una reserva mantenimiento mixto del sistema.',
  })
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
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear reserva general multiple',
    description: 'Crear una reserva general multiple del sistema.',
  })
  createReservaGeneralMultiple(
    @Body()
    createReservaGeneralMultipleDto: CreateReservaGeneralMultipleDto,
  ) {
    return this.reservaService.createReservaGeneralMultiple(
      createReservaGeneralMultipleDto,
    );
  }

  @Post('mixto-multiple')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear reserva mixto multiple',
    description: 'Crear una reserva mixto multiple del sistema.',
  })
  createReservaMixtoMultiple(
    @Body()
    createReservaMixtoMultipleDto: CreateReservaMixtoMultipleDto,
  ) {
    return this.reservaService.createReservaMixtoMultiple(
      createReservaMixtoMultipleDto,
    );
  }

  @Post('mantenimiento-general-multiple')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear reserva mantenimiento general multiple',
    description: 'Crear una reserva mantenimiento general multiple del sistema.',
  })
  createReservaMantenimientoGeneralMultiple(
    @Body()
    createReservaMantenimientoGeneralMultipleDto: CreateReservaMantenimientoGeneralMultipleDto,
  ) {
    return this.reservaService.createReservaMantenimientoGeneralMultiple(
      createReservaMantenimientoGeneralMultipleDto,
    );
  }

  @Post('mantenimiento-mixto-multiple')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear reserva mantenimiento mixto multiple',
    description: 'Crear una reserva mantenimiento mixto multiple del sistema.',
  })
  createReservaMantenimientoMixtoMultiple(
    @Body()
    createReservaMantenimientoMixtoMultipleDto: CreateReservaMantenimientoMixtoMultipleDto,
  ) {
    return this.reservaService.createReservaMantenimientoMixtoMultiple(
      createReservaMantenimientoMixtoMultipleDto,
    );
  }

  @Get('credenciales-disponibles')
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Obtener credenciales disponibles',
    description: 'Obtener credenciales disponibles del sistema.',
  })
  async countCredencialesDisponibles(
    @Query() credencialesDisponiblesDto: CredencialesDisponiblesDto,
  ) {
    return this.reservaService.countCredencialesDisponibles(
      credencialesDisponiblesDto,
    );
  }

  @Get('in-range')
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Obtener reservas en rango',
    description: 'Obtener reservas en rango del sistema.',
  })
  findReservasInRange(
    @Query() paginationReservaInRangeDto: PaginationReservaInRangeDto,
  ) {
    return this.reservaService.findReservasInRange(paginationReservaInRangeDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Obtener todas las reservas',
    description: 'Obtener todas las reservas del sistema.',
  })
  findAll(@Query() paginationReservaDto: PaginationReservaDto) {
    return this.reservaService.findAll(paginationReservaDto);
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Obtener una reserva',
    description: 'Obtener una reserva del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.reservaService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReservaDto: UpdateReservaDto) {
  //   return this.reservaService.update(id, updateReservaDto);
  // }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar una reserva',
    description: 'Eliminar una reserva del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.reservaService.remove(id);
  }
}
