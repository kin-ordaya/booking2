import { IsOptional, IsString } from "class-validator";

export class SearchDto {
  @IsOptional()
  @IsString({ message: 'El campo search debe ser de tipo string' })
  search?: string;
}