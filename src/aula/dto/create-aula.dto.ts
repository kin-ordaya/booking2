import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateAulaDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  nombre: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo codigo debe ser de tipo string' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  codigo: string;

  @IsNotEmpty()
  @IsInt({ message: 'El campo piso debe ser de tipo int' })
  @Type(() => Number)
  @IsPositive({})
  piso: number;

  @IsNotEmpty()
  @IsString({ message: 'El campo pabellon debe ser de tipo int' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  pabellon: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo campus_id debe ser de tipo uuid' })
  campus_id: string
}
