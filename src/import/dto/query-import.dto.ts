import { IsIn, IsString } from 'class-validator';

export class QueryImportDto {
  @IsString({ message: 'El campo "tipo" debe ser un string' })
  @IsIn(['usuarios', 'cursos', 'credenciales'], {
    message: 'El campo "tipo" debe ser "usuarios", "cursos" o "credenciales"',
  })
  tipo: string;

  @IsString({ message: 'El campo "hoja" debe ser un string' })
  @IsIn(['usuario', 'credencial'], {
    message: 'El campo "hoja" debe ser "usuario" o "credencial"'
  })
  hoja: string;
}
