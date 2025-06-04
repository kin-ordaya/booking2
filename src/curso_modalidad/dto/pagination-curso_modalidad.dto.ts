import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class PaginationCursoModalidadDto extends PaginationDto {
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

  @ApiProperty({
    description: 'Filtros por uno o más IDs de modalidad',
    type: () => [String],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value : (value?.split(',').filter(Boolean) ?? []),
  )
  @IsArray()
  @Type(() => String)
  modalidad_id?: string[];

  @ApiProperty({
    description: 'Filtros por uno o más IDs de plan',
    type: () => [String],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value : (value?.split(',').filter(Boolean) ?? []),
  )
  @IsArray()
  @Type(() => String)
  plan_id?: string[];
}
