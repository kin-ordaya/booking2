import { IsNotEmpty, IsUUID } from "class-validator";

export class RecursoDocenteClaseDto {
    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
    recurso_id: string;

    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo rol_usuario_id debe ser de tipo uuid' })
    rol_usuario_id: string;
}