import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCursoDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo codigo debe ser de tipo string' })
  @MaxLength(20, { message: 'El campo codigo no puede tener mas de 20 caracteres' })
  codigo: string;

  @IsOptional()
  @IsString({ message: 'El campo codigo_cruzado debe ser de tipo string' })
  @MaxLength(20, { message: 'El campo codigo_cruzado no puede tener mas de 20 caracteres' })
  codigo_cruzado?: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @MaxLength(100, { message: 'El campo nombre no puede tener mas de 50 caracteres' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  nombre: string;

  @IsOptional()
  @IsString({ message: 'El campo descripcion debe ser de tipo string' })
  @MaxLength(100, { message: 'El campo descripcion no puede tener mas de 100 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El campo eap_id debe ser de tipo uuid' })
  eap_id?: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo plan_id debe ser de tipo uuid' })
  plan_id: string;
}
