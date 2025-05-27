import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class PaginationFacultadDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3, 4], {
    message: 'El campo sort debe ser 1(ASC), 2(DESC), 3(Activo) o 4(Inactivo)',
  })
  @Type(() => Number)
  sort?: number;
}
