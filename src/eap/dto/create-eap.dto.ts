import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateEapDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @MaxLength(100, {
    message: 'El campo nombre no puede tener mas de 100 caracteres',
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  nombre: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo facultad_id debe ser de tipo uuid' })
  facultad_id: string;
}
