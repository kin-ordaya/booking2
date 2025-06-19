import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateLaboratorioAulaDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo laboratorio_id debe ser de tipo uuid' })
  laboratorio_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo aula_id debe ser de tipo uuid' })
  aula_id: string;
}
