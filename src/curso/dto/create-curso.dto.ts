import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCursoDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo codigo debe ser de tipo string' })
  @MaxLength(20, { message: 'El campo codigo no puede tener mas de 20 caracteres' })
  codigo: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @MaxLength(50, { message: 'El campo nombre no puede tener mas de 50 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'El campo descripcion debe ser de tipo string' })
  @MaxLength(100, { message: 'El campo descripcion no puede tener mas de 100 caracteres' })
  descripcion?: string;
}
