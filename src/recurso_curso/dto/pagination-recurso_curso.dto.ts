import { IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/common/dtos/pagination.dto";

export class PaginationRecursoCursoDto extends PaginationDto {
    @IsOptional()
    @IsUUID('4', { message: 'El campo curso_id debe ser de tipo uuid' })
    curso_id?: string;
}