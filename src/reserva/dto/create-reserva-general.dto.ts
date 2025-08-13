import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { CreateReservaMantenimientoDto } from './create-reserva.dto';

export class CreateReservaGeneralDto extends CreateReservaMantenimientoDto {
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
  @ApiPropertyOptional({
    description: 'clase_id opcional cuando es mantenimiento = 1',
  })
  @IsUUID('4', { message: 'El campo clase_id debe ser de tipo uuid' })
  clase_id: string;

  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'docente_id opcional cuando es mantenimiento = 1',
  })
  @IsUUID('4', { message: 'El campo docente_id debe ser de tipo uuid' })
  docente_id: string;
}
