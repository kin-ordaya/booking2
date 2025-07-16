import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateReservaDto {
  @IsInt()
  @IsIn([0, 1], { message: 'El campo mantenimiento debe ser 0 o 1' })
  @Type(() => Number)
  mantenimiento: number;

  // @IsOptional()
  // @IsString()
  // @MaxLength(100, {message: 'El campo descripcion debe tener un maximo de 100 caracteres'})
  // descripcion?: string;

  // @IsNotEmpty()
  // @IsDateString()
  // fecha: string;

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'El campo inicio debe tener el formato YYYY-MM-DD' },
  )
  // @Matches(/^\d{2}:\d{2}$/, {message: 'El campo inicio debe tener el formato HH:MM'})
  inicio: Date;

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'El campo fin debe tener el formato YYYY-MM-DD' },
  )
  // @Matches(/^\d{2}:\d{2}$/, {message: 'El campo fin debe tener el formato HH:MM'})
  fin: Date;

  @ApiPropertyOptional({ description: 'cantidad_accesos_general opcional cuando es mantenimiento = 1' })
  @IsOptional()
  @IsInt()
  @IsPositive({ message: 'El campo cantidad_accesos debe ser positivo' })
  @Type(() => Number)
  cantidad_accesos_general?: number;

  @ApiPropertyOptional({ description: 'cantidad_accesos_docente opcional cuando es mantenimiento = 1' })
  @IsOptional()
  @IsInt()
  @Min(0, {
    message: 'El campo cantidad_accesos_docente debe ser mayor o igual a 0',
  })
  @Type(() => Number)
  cantidad_accesos_docente?: number;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;

  @ApiPropertyOptional({ description: 'clase_id opcional cuando es mantenimiento = 1' })
  @IsOptional()
  @IsUUID('4', { message: 'El campo clase_id debe ser de tipo uuid' })
  clase_id?: string;

  @ApiPropertyOptional({ description: 'docente_id opcional cuando es mantenimiento = 1' })
  @IsOptional()
  @IsUUID('4', { message: 'El campo docente_id debe ser de tipo uuid' })
  docente_id?: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo autor_id debe ser de tipo uuid' })
  autor_id: string;
}
