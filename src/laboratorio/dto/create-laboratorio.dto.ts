import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateLaboratorioDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'El campo nombre no puede tener mas de 100 caracteres',
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  nombre: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50, {
    message: 'El campo codigo no puede tener mas de 50 caracteres',
  })
  codigo: string;

  @IsNotEmpty()
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo pabellon_id debe ser de tipo uuid' })
  campus_id: string;
}
