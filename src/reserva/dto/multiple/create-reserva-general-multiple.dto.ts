import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { RangoFechaDto } from '../base/rango-fecha.dto';
import { Type } from 'class-transformer';
import { BaseReservaDto } from '../base/reserva-base.dto';

export class CreateReservaGeneralMultipleDto extends BaseReservaDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo clase_id debe ser de tipo uuid' })
  clase_id: string;

  @IsOptional()
  @IsUUID('4', { message: 'El campo docente_id debe ser de tipo uuid' })
  docente_id?: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive({ message: 'El campo cantidad_accesos debe ser positivo' })
  @Type(() => Number)
  cantidad_accesos_general: number;

  @IsArray()
  @ValidateNested()
  @Type(() => RangoFechaDto)
  rangos_fechas: RangoFechaDto[];
}
