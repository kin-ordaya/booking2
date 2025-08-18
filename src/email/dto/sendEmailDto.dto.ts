import { IsEmail, IsNotEmpty, IsUUID, Matches } from 'class-validator';

export class sendEmailDto {
  //El correo debe tener el dominio continental.edup.pe
  // @IsNotEmpty()
  // @Matches(/^[a-zA-Z0-9._%+-]+@continental\.edu\.pe$/, {
  //   message: 'El correo debe tener el dominio @continental.edu.pe',
  // })
  // @IsEmail({}, { message: 'El email no es valido' })
  // correo: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El ID de la reserva debe ser de tipo uuid' })
  docente_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El ID de la reserva debe ser de tipo uuid' })
  reserva_id: string;
}
