import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateUsuarioDto {
    @IsNotEmpty()
    @IsString({ message: 'El campo nombres no puede estar vacío' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : String(value).toUpperCase().trim())
    nombres: string;

    @IsNotEmpty()
    @IsString({ message: 'El campo apellidos no puede estar vacío' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : String(value).toUpperCase().trim())
    apellidos: string;

    @IsNotEmpty()
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : String(value).toUpperCase().trim())
    numero_documento: string;

    @IsNotEmpty()
    @IsEmail({},{ message: 'El campo correo_institucional no puede estar vacío' })
    @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase().trim() : String(value).toLowerCase().trim())
    correo_institucional: string;

    @IsOptional()
    @IsEmail({},{ message: 'El campo correo_personal debe ser un email válido' })
    @Transform(({ value }) => value ? (typeof value === 'string' ? value.toLowerCase().trim() : String(value).toLowerCase().trim()) : null)
    correo_personal?: string;

    @IsOptional()
    @Transform(({ value }) => value ? (typeof value === 'string' ? value.trim() : String(value).trim()) : null)
    telefono_institucional?: string;

    @IsOptional()
    @Transform(({ value }) => value ? (typeof value === 'string' ? value.trim() : String(value).trim()) : null)
    telefono_personal?: string;

    @IsOptional()
    @IsIn(['F', 'M'], { message: 'El campo sexo debe ser F o M' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : String(value).toUpperCase().trim())
    sexo?: string;

    @IsOptional()
    @Transform(({ value }) => value ? (typeof value === 'string' ? value.trim() : String(value).trim()) : null)
    direccion?: string;

    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo documento_identidad_id debe ser de tipo uuid' })
    documento_identidad_id: string;

    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo rol_id debe ser de tipo uuid' })
    rol_id: string;
}