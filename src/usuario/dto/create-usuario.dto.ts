export class CreateUsuarioDto {
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
