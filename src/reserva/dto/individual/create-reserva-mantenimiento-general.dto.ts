import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';
import { RangoFechaDto } from '../base/rango-fecha.dto';

export class CreateReservaMantenimientoGeneralDto extends RangoFechaDto{
  // @IsInt()
  // @IsIn([0, 1], { message: 'El campo mantenimiento debe ser 0 o 1' })
  // @Type(() => Number)
  // mantenimiento: number;

  @IsOptional()
  @ApiPropertyOptional({
    description:
      'cantidad_accesos_general opcional cuando es mantenimiento = 1',
  })
  @IsInt()
  @Min(0, {
    message: 'El campo cantidad_accesos_general debe ser mayor o igual a 0',
  })
  @Type(() => Number)
  cantidad_accesos_general?: number;

  // @IsNotEmpty()
  // @IsDateString(
  //   {},
  //   { message: 'El campo inicio debe tener el formato YYYY-MM-DD' },
  // )
  // inicio: Date;

  // @IsNotEmpty()
  // @IsDateString(
  //   {},
  //   { message: 'El campo fin debe tener el formato YYYY-MM-DD' },
  // )
  // fin: Date;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo autor_id debe ser de tipo uuid' })
  autor_id: string;
}
