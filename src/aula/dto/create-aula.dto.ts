import { Transform} from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAulaDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  nombre: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo codigo debe ser de tipo string' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  codigo: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo pabellon_id debe ser de tipo uuid' })
  pabellon_id: string
}
