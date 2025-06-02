import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProveedorDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @MaxLength(50, {
    message: 'El campo nombre no puede tener mas de 50 caracteres',
  })
  nombre: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo pais debe ser de tipo string' })
  @MaxLength(100, {
    message: 'El campo pais no puede tener mas de 100 caracteres',
  })
  pais: string;

  @IsOptional()
  @IsString({ message: 'El campo ruc debe ser de tipo string' })
  @MaxLength(20, {
    message: 'El campo ruc no puede tener mas de 20 caracteres',
  })
  ruc?: string;

  @IsOptional()
  @IsString({ message: 'El campo telefono debe ser de tipo string' })
  @MaxLength(20, {
    message: 'El campo telefono no puede tener mas de 20 caracteres',
  })
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El campo correo debe ser de tipo email' })
  correo?: string;

  @IsOptional()
  @IsString({ message: 'El campo descripcion debe ser de tipo string' })
  @MaxLength(150, {
    message: 'El campo descripcion no puede tener mas de 150 caracteres',
  })
  descripcion?: string;
}
