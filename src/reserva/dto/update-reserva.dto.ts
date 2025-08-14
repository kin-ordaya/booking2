import { PartialType } from '@nestjs/swagger';
import { CreateReservaMantenimientoGeneralDto } from './create-reserva-mantenimiento-general.dto';

export class UpdateReservaDto extends PartialType(CreateReservaMantenimientoGeneralDto) {}
