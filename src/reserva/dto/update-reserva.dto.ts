import { PartialType } from '@nestjs/swagger';
import { CreateReservaMantenimientoGeneralDto } from './individual/create-reserva-mantenimiento-general.dto';

export class UpdateReservaDto extends PartialType(CreateReservaMantenimientoGeneralDto) {}
