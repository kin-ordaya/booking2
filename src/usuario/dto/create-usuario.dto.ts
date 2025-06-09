import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateUsuarioDto {
    @IsNotEmpty()
    @IsString({ message: 'El campo nombres no puede estar vacío' })
    @Transform(({ value }) => value?.toUpperCase().trim())
    nombres: string;
    apellidos: string;
    numero_documento: string;
    correo_institucional?: string;
    correo_personal?: string;
    telefono_institucional?: string;
    telefono_personal?: string;
    sexo?: string;
    direccion?: string;
    estado_civil?: string;
    documento_identidad_id: string;
}
