import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCredencialDto {
  @IsOptional()
  @IsString({ message: 'El campo usuario debe ser de tipo string' })
  usuario?: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo clave debe ser de tipo string' })
  clave: string;

  // @IsNotEmpty()
  // @IsInt({ message: 'El campo capacidad debe ser de tipo int' })
  // @IsPositive({ message: 'El campo capacidad debe ser positivo' })
  // @Type(() => Number)
  // capacidad: number;

  // @IsNotEmpty()
  // @IsString({ message: 'El campo tipo debe ser de tipo string' })
  // @IsIn(['GENERAL', 'DOCENTE', 'ESTUDIANTE'], {
  //   message: 'El campo tipo debe ser GENERAL, DOCENTE o ESTUDIANTE',
  // })
  // tipo: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo rol_id debe ser de tipo uuid' })
  rol_id: string;
}
