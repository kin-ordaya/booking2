import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CreateReservaMantenimientoGeneralDto {
  // @IsInt()
  // @IsIn([0, 1], { message: 'El campo mantenimiento debe ser 0 o 1' })
  // @Type(() => Number)
  // mantenimiento: number;

  @IsNotEmpty()
  @ApiPropertyOptional({
    description:
      'cantidad_accesos_general opcional cuando es mantenimiento = 1',
  })
  @IsInt()
  @IsPositive({ message: 'El campo cantidad_accesos debe ser positivo' })
  @Type(() => Number)
  cantidad_accesos_general: number;

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'El campo inicio debe tener el formato YYYY-MM-DD' },
  )
  inicio: Date;

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'El campo fin debe tener el formato YYYY-MM-DD' },
  )
  fin: Date;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo autor_id debe ser de tipo uuid' })
  autor_id: string;
}
