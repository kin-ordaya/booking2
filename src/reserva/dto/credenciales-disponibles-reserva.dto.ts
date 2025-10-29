import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { RangoFechaDto } from './base/rango-fecha.dto';

export class CredencialesDisponiblesDto extends RangoFechaDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;

  // @IsNotEmpty()
  // @IsDateString(
  //   {},
  //   { message: 'El campo inicio debe tener el formato YYYY-MM-DDT00:00:00' },
  // )
  // inicio: string;

  // @IsNotEmpty()
  // @IsDateString(
  //   {},
  //   { message: 'El campo fin debe tener el formato YYYY-MM-DDT00:00:00' },
  // )
  // fin: string;
}
