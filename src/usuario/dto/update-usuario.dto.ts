import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString({ message: 'El campo nombres no puede estar vacío' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  nombres?: string;

  @IsOptional()
  @IsString({ message: 'El campo apellidos no puede estar vacío' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  apellidos?: string;

  @IsOptional()
  @IsString({ message: 'El campo numero_documento no puede estar vacío' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  numero_documento?: string;

  @IsOptional()
  @IsEmail(
    {},
    { message: 'El campo correo_institucional no puede estar vacío' },
  )
  correo_institucional?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El campo correo_personal no puede estar vacío' })
  correo_personal?: string;

  @IsOptional()
  @IsString({ message: 'El campo telefono_institucional no puede estar vacío' })
  telefono_institucional?: string;

  @IsOptional()
  @IsString({ message: 'El campo telefono_personal no puede estar vacío' })
  telefono_personal?: string;

  @IsOptional()
  @IsIn(['F', 'M'], { message: 'El campo sexo no puede estar vacío' })
  sexo?: string;

  @IsOptional()
  @IsString({ message: 'El campo direccion no puede estar vacío' })
  direccion?: string;

}
