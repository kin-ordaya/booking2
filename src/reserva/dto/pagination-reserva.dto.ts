import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class PaginationReservaDto {
  @IsNotEmpty()
  @IsUUID()
  recurso_id: string;

  @IsNotEmpty()
  @IsDateString()
  inicio: string;

  @IsNotEmpty()
  @IsDateString()
  fin: string;
}
