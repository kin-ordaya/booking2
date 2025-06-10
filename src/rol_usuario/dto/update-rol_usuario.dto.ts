import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class UpdateRolUsuarioDto {
    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo usuario_id debe ser de tipo uuid' })
    rol_id: string;
}
