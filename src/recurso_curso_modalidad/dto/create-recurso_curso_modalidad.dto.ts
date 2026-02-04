import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRecursoCursoModalidadDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo curso_modalidad_id debe ser de tipo uuid' })
  curso_modalidad_id: string;
}
