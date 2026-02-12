import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DetalleReservaService } from './detalle_reserva.service';
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

}
