import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFacultadDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @MaxLength(100, {
    message: 'El campo nombre no puede tener mas de 100 caracteres',
  })
  nombre: string;
}
