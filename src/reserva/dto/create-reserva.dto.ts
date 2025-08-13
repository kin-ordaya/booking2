import {
  IsDateString,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateReservaMantenimientoDto {
  // @IsInt()
  // @IsIn([0, 1], { message: 'El campo mantenimiento debe ser 0 o 1' })
  // @Type(() => Number)
  // mantenimiento: number;

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'El campo inicio debe tener el formato YYYY-MM-DD' },
  )
  inicio: Date;

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'El campo fin debe tener el formato YYYY-MM-DD' },
  )
  fin: Date;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo autor_id debe ser de tipo uuid' })
  autor_id: string;
}
