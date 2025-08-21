import { IsNotEmpty, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class PaginationDetalleReservaDto extends PaginationDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  reserva_id: string;
}
