import { PartialType } from '@nestjs/swagger';
import { CreateReservaMantenimientoDto } from './create-reserva.dto';

export class UpdateReservaDto extends PartialType(CreateReservaMantenimientoDto) {}
