import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateRecursoCursoDto {
    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
    recurso_id: string;
    
    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo curso_id debe ser de tipo uuid' })
    curso_id: string;
}
