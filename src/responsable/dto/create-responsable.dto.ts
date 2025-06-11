import { IsNotEmpty, IsOptional, IsUUID, ValidateIf } from 'class-validator';


export class CreateResponsableDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo rol_usuario_id debe ser de tipo uuid' })
  rol_usuario_id: string;

  @IsOptional()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El campo clase_id debe ser de tipo uuid' })
  @ValidateIf((o) => !o.recurso_id && !o.curso_modalidad_id)
  clase_id?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El campo curso_modalidad_id debe ser de tipo uuid' })
  @ValidateIf((o) => !o.recurso_id && !o.clase_id)
  curso_modalidad_id?: string;
}
