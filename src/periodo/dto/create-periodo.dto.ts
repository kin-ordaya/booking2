import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreatePeriodoDto {
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  nombre: string;

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
}
