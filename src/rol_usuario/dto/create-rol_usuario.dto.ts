import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRolUsuarioDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo usuario_id debe ser de tipo uuid' })
  usuario_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo rol_id debe ser de tipo uuid' })
  rol_id: string;
}
