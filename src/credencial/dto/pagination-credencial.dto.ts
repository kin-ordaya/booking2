import { IsNotEmpty, IsUUID } from "class-validator";
import { PaginationDto } from "src/common/dtos/pagination.dto";

export class PaginationCredencialDto extends PaginationDto {
    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
    recurso_id: string;
}