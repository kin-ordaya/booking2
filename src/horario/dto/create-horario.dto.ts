import { IsIn, IsString, Matches } from 'class-validator';

export class CreateHorarioDto {
  @IsString()
  @IsIn(['L', 'M', 'X', 'J', 'V', 'S', 'D'], {
    message: 'El campo dia debe ser una de las siguientes: L, M, X, J, V, S, D',
  })
  dia: string;

  @IsString()
  @Matches(/^[0-9]{2}:[0-9]{2}$/, {
    message: 'El campo inicio debe tener el formato HH:MM',
  })
  inicio: string; // Formato HH:MM

  @IsString()
  @Matches(/^[0-9]{2}:[0-9]{2}$/, {
    message: 'El campo fin debe tener el formato HH:MM',
  })
  fin: string; // Formato HH:MM
}
