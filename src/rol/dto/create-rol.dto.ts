import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRolDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  nombre: string;
}
