import { IsNotEmpty, IsUUID } from 'class-validator';
import { RangoFechaDto } from './base/rango-fecha.dto';

export class CredencialesDisponiblesDto extends RangoFechaDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;
}
