import { PartialType } from '@nestjs/swagger';
import { CreateGrupoReservaDto } from './create-grupo_reserva.dto';

export class UpdateGrupoReservaDto extends PartialType(CreateGrupoReservaDto) {}
