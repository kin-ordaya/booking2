import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateReservaMantenimientoGeneralDto } from './create-reserva-mantenimiento-general.dto';

export class CreateReservaGeneralDto extends CreateReservaMantenimientoGeneralDto {
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
