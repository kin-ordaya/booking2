import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCampusDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50, {message: 'El campo nombre no puede tener mas de 50 caracteres'})
    @Transform(({ value }) => value?.toUpperCase().trim())
    nombre: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50, {message: 'El campo codigo no puede tener mas de 50 caracteres'})
    codigo: string;
    
}
