import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PaginationDto {
  @IsInt({ message: 'El campo page debe ser de tipo number' })
  @Min(1, { message: 'El campo page debe ser mayor a 1' })
  @Type(() => Number)
  page: number = 1;

  @IsInt({ message: 'El campo limit debe ser de tipo number' })
  @Min(1, { message: 'El campo limit debe ser mayor a 1' })
  @Max(100, { message: 'El campo limit no puede ser mayor a 100' })
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3, 4], {
    message: 'El campo sort debe ser 1(ASC), 2(DESC), 3(Activo) o 4(Inactivo)',
  })
  @Type(() => Number)
  sort?: number;

  @IsOptional()
  @IsString({ message: 'El campo search debe ser de tipo string' })
  search?: string;
}
