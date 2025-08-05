import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateUsuarioDto {
    @IsNotEmpty()
    @IsString({ message: 'El campo nombres no puede estar vacío' })
    @Transform(({ value }) => value?.toUpperCase().trim())
    nombres: string;

    @IsNotEmpty()
    @IsString({ message: 'El campo apellidos no puede estar vacío' })
    @Transform(({ value }) => value?.toUpperCase().trim())
    apellidos: string;

    @IsNotEmpty()
    @IsString({ message: 'El campo numero_documento no puede estar vacío' })
    @Transform(({ value }) => value?.toUpperCase().trim())
    numero_documento: string;

    @IsNotEmpty()
    @IsEmail({},{ message: 'El campo correo_institucional no puede estar vacío' })
    correo_institucional: string;

    @IsOptional()
    @IsEmail({},{ message: 'El campo correo_personal no puede estar vacío' })
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

    // @IsOptional()
    // @IsIn(['SOLTERO','CASADO','DIVORCIADO','SEPARADO','VIUDO','OTRO'], { message: 'El campo estado_civil no puede estar vacío' })
    // estado_civil?: string;
    
    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo documento_identidad_id debe ser de tipo uuid' })
    documento_identidad_id: string;

    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo rol_id debe ser de tipo uuid' })
    rol_id?: string;
}
