import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCredencialDto {
  @IsOptional()
  @IsString({ message: 'El campo usuario debe ser de tipo string' })
  usuario?: string;

  @IsOptional()
  @IsString({ message: 'El campo clave debe ser de tipo string' })
  clave?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El campo rol_id debe ser de tipo uuid' })
  rol_id?: string;
}
