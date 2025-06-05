import { PartialType } from '@nestjs/swagger';
import { CreateTipoAccesoDto } from './create-tipo_acceso.dto';

export class UpdateTipoAccesoDto extends PartialType(CreateTipoAccesoDto) {}
