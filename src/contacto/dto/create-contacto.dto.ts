import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateContactoDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombres debe ser de tipo string' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  @MaxLength(50, {
    message: 'El campo nombres no puede tener mas de 50 caracteres',
  })
  nombres: string;

  @IsOptional()
  @IsString({ message: 'El campo apellidos debe ser de tipo string' })
  @MaxLength(100, {
    message: 'El campo apellidos no puede tener mas de 100 caracteres',
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  apellidos?: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo telefono debe ser de tipo string' })
  @MaxLength(20, {
    message: 'El campo telefono no puede tener mas de 20 caracteres',
  })
  telefono: string;

  @IsOptional()
  @IsString({ message: 'El campo correo debe ser de tipo string' })
  @MaxLength(100, {
    message: 'El campo correo no puede tener mas de 100 caracteres',
  })
  correo?: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo proveedor_id debe ser de tipo uuid' })
  proveedor_id: string;
}
