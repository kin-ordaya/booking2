import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRecursoCursoPeriodoDto {
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
  @IsUUID('4', { message: 'El campo recurso_curso_id debe ser de tipo uuid' })
  recurso_curso_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo periodo_id debe ser de tipo uuid' })
  periodo_id: string;
}
