import { IsEmail, IsNotEmpty, IsUUID} from 'class-validator';

export class sendEmailDto {

  @IsNotEmpty()
  @IsEmail({}, { message: 'El email no es valido' })
  correo: string;

  @IsNotEmpty()
  @IsUUID('4', {message: 'El ID de la reserva debe ser de tipo uuid'})
  reserva_id: string;
}
