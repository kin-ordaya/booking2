import { PaginationDto } from '@/common/dtos/pagination.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class GetRecursoCursoModalidadPeriodoDto extends PaginationDto {
  @IsOptional()
  @IsUUID('4', {
    message: 'El campo recurso_modalidad_id debe ser de tipo uuid',
  })
  recurso_modalidad_id?: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'El campo curso_modalidad_id debe ser de tipo uuid',
  })
  periodo_id?: string;
}
