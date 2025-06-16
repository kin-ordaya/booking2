import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAulaDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  nombre: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo codigo debe ser de tipo string' })
  codigo: string;

  @IsNotEmpty()
  @IsInt({ message: 'El campo piso debe ser de tipo int' })
  @Type(() => Number)
  piso: number;

  @IsNotEmpty()
  @IsString({ message: 'El campo pabellon debe ser de tipo int' })
  pabellon: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo campus_id debe ser de tipo uuid' })
  campus_id: string
}
