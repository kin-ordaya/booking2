import { IsNotEmpty, IsUUID } from 'class-validator';

export class SendEmailGrupoDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El ID del grupo de la reserva debe ser de tipo uuid' })
  grupo_reserva_id: string;
}
