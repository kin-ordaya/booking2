import { IsUUID } from 'class-validator';

export class GetRecursoCursoPeriodoDto {
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;

  @IsUUID('4', { message: 'El campo curso_id debe ser de tipo uuid' })
  curso_id: string;

  @IsUUID('4', { message: 'El campo periodo_id debe ser de tipo uuid' })
  periodo_id: string;
}
