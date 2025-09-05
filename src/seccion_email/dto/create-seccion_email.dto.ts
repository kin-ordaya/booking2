import { IsIn, IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateSeccionEmailDto {
  @IsNotEmpty()
  @IsIn(['ADVERTENCIA', 'INFORMACION', 'INSTRUCCION'])
  asunto: 'ADVERTENCIA' | 'INFORMACION' | 'INSTRUCCION'; // Mismo tipo que la entidad

  @IsNotEmpty()
  @IsUrl({}, { message: 'El campo link debe ser de tipo url' })
  link: string;

  @IsNotEmpty()
  @IsIn(['LINK', 'IMAGEN'])
  tipo: 'LINK' | 'IMAGEN';

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;
}
