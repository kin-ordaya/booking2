import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateRecursoDto {
    @IsString({ message: 'El campo nombre debe ser de tipo string' })
    nombre: string;

    @IsOptional()
    @IsString({ message: 'El campo descripcion debe ser de tipo string' })
    descripcion?: string;

    @IsInt({ message: 'El campo cantidad_credenciales debe ser de tipo int' })
    
    cantidad_credenciales: number;
    link_declaracion: string;
    tiempo_reserva: number;
    tipo_recurso_id: string;
    proveedor_id: string;

}
