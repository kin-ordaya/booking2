import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEapDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @MaxLength(100, {
    message: 'El campo nombre no puede tener mas de 100 caracteres',
  })
  nombre: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo facultad_id debe ser de tipo string' })
  facultad_id: string;
}
