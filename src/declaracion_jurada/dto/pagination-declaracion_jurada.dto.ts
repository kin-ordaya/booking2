import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class PaginationDeclaracionJuradaDto extends PaginationDto {
  @IsOptional()
  @IsUUID('4', { message: 'El campo rol_usuario_id debe ser de tipo uuid' })
  rol_usuario_id?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id?: string;
}
