import { PaginationDto } from '@/common/dtos/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class PaginationRecursoCursoModalidadDto extends PaginationDto {
  @ApiProperty({ description: 'Ordena por nombre asc=1, desc=2' })
  @IsOptional()
  @IsNumber()
  @IsIn([1, 2], {
    message: 'Ordernar por nombre asc=1, desc=2',
  })
  @Type(() => Number)
  sort_name?: number;

  @ApiProperty({ description: 'Ordena por estado activo=1, inactivo=2' })
  @IsOptional()
  @IsNumber()
  @IsIn([1, 2], {
    message: 'Ordernar por estado activo=1, inactivo=2',
  })
  @Type(() => Number)
  sort_state?: number;

  @IsOptional()
  @IsUUID('4', { message: 'El campo curso_modalidad_id debe ser de tipo uuid' })
  curso_modalidad_id?: string;
}
