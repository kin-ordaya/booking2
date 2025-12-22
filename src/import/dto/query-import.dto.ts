import { IsIn, IsString } from 'class-validator';

export class QueryImportDto {
  @IsString({ message: 'El campo "tipo" debe ser un string' })
  @IsIn(['usuarios', 'cursos'], {
    message: 'El campo "tipo" debe ser "usuarios" o "cursos"',
  })
  tipo: string;
}
