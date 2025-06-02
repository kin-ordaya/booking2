import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class PaginationCursoDto extends PaginationDto {
  @ApiProperty({ description: 'Ordena por nombre asc=1, desc=2' })
  @IsOptional()
  @IsNumber()
  @IsIn([1, 2], {
    message: 'El campo sort debe ser 1(ASC), 2(DESC)',
  })
  @Type(() => Number)
  sort_name?: number;

  @ApiProperty({ description: 'Ordena por estado activo=1, inactivo=2' })
  @IsOptional()
  @IsNumber()
  @IsIn([1, 2], {
    message: 'El campo sort debe ser 1(Activo) o 2(Inactivo)',
  })
  sort_state?: number;
}
