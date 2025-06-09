import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateDocumentoIdentidadDto {
    @IsNotEmpty()
    @IsString({ message: 'El campo nombre no puede estar vacío' })
    @MaxLength(100, { message: 'El campo nombre no puede tener más de 100 caracteres' })
    @Transform(({ value }) => value?.toUpperCase().trim())
    nombre: string;
}
