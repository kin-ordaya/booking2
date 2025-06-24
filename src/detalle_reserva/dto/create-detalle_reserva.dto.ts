import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateDetalleReservaDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo pabellon_id debe ser de tipo uuid' })
  reserva_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo pabellon_id debe ser de tipo uuid' })
  credencial_id: string;
}
