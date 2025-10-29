import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { CreateReservaGeneralDto } from './create-reserva-general.dto';



export class CreateReservaMixtoDto extends CreateReservaGeneralDto {

  @IsNotEmpty()
  @ApiPropertyOptional({
    description:
      'cantidad_accesos_docente opcional cuando es mantenimiento = 1',
  })
  @IsInt()
  @Min(0, {
    message: 'El campo cantidad_accesos_docente debe ser mayor o igual a 0',
  })
  @Type(() => Number)
  cantidad_accesos_docente: number;
}
