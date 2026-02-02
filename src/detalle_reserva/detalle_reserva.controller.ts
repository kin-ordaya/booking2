import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DetalleReservaService } from './detalle_reserva.service';
import { CreateDetalleReservaDto } from './dto/create-detalle_reserva.dto';
import { UpdateDetalleReservaDto } from './dto/update-detalle_reserva.dto';
import { PaginationDetalleReservaDto } from './dto/pagination_reserva.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('detalle-reserva')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class DetalleReservaController {
  constructor(private readonly detalleReservaService: DetalleReservaService) {}

  // @Post()
  // @Roles('ADMINISTRADOR')
  // create(@Body() createDetalleReservaDto: CreateDetalleReservaDto) {
  //   return this.detalleReservaService.create(createDetalleReservaDto);
  // }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Obtener todos los detalles de reservas',
    description: 'Obtener todos los detalles de reservas del sistema.',
  })
  findAll(@Query() paginationDetalleReservaDto: PaginationDetalleReservaDto) {
    return this.detalleReservaService.findAll(paginationDetalleReservaDto);
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un detalle de reserva',
    description: 'Obtener un detalle de reserva del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.detalleReservaService.findOne(+id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un detalle de reserva',
    description:
      'Actualizar un detalle de reserva del sistema por su ID y datos de actualización.',
  })
  update(
    @Param('id') id: string,
    @Body() updateDetalleReservaDto: UpdateDetalleReservaDto,
  ) {
    return this.detalleReservaService.update(+id, updateDetalleReservaDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un detalle de reserva',
    description: 'Eliminar un detalle de reserva del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.detalleReservaService.remove(+id);
  }
}
