import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCursoModalidadDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo curso_id debe ser de tipo uuid' })
  curso_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo modalidad_id debe ser de tipo uuid' })
  modalidad_id: string;
}
