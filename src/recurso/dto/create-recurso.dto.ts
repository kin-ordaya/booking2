import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateRecursoDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  nombre: string;

  @IsOptional()
  @IsString({ message: 'El campo descripcion debe ser de tipo string' })
  descripcion?: string;

  @IsNotEmpty()
  @IsInt({ message: 'El campo cantidad_credenciales debe ser de tipo int' })
  @IsPositive({ message: 'El campo cantidad_credenciales debe ser positivo' })
  @Type(() => Number)
  cantidad_credenciales: number;

  @IsNotEmpty()
  @IsUrl({}, { message: 'El campo link_declaracion debe ser de tipo url' })
  link_declaracion: string;

  @IsNotEmpty()
  @IsInt({ message: 'El campo tiempo_reserva debe ser de tipo int' })
  @IsPositive({ message: 'El campo tiempo_reserva debe ser positivo' })
  @Type(() => Number)
  tiempo_reserva: number;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo tipo_recurso_id debe ser de tipo uuid' })
  tipo_recurso_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo proveedor_id debe ser de tipo uuid' })
  proveedor_id: string;
}
