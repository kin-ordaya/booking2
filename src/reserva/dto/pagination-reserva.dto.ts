import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class PaginationReservaDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;

  @IsNotEmpty()
  @IsDateString({},{ message: 'El campo inicio debe ser de tipo fecha y en formato YYYY-MM-DDTHH:mm:ss' })
  inicio: string;

  @IsNotEmpty()
  @IsDateString({},{ message: 'El campo inicio debe ser de tipo fecha y en formato YYYY-MM-DDTHH:mm:ss' })
  fin: string;
}
