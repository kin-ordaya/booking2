import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @IsNotEmpty()
  @IsEmail()
  @Matches(/^[\w.+-]+@continental\.edu\.pe$/, {
    message: 'El correo debe pertenecer al dominio @continental.edu.pe',
  })
  email: string;
}
