import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/common/dtos/pagination.dto";

export class PaginationRecursoDto extends PaginationDto {
  @ApiProperty({ description: 'Ordena por nombre asc=1, desc=2' })
  @IsOptional()
  @IsNumber()
  @IsIn([1, 2], {
    message: 'Ordernar por nombre asc=1, desc=2',
  })
  @Type(() => Number)
  sort_name?: number;

  @ApiProperty({ description: 'Filtra por rol_usuario_id' })
  @IsOptional()
  @IsUUID()
  rol_usuario_id?: string;

  @ApiProperty({ description: 'Ordena por estado activo=1, inactivo=2' })
  @IsOptional()
  @IsNumber()
  @IsIn([1, 2], {
    message: 'Ordernar por estado activo=1, inactivo=2',
  })
  @Type(() => Number)
  sort_state?: number;
}
