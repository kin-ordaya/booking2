import { PartialType } from '@nestjs/swagger';
import { CreateDetalleReservaDto } from './create-detalle_reserva.dto';

export class UpdateDetalleReservaDto extends PartialType(CreateDetalleReservaDto) {}
