import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";


export class CreatePabellonDto {
    @IsNotEmpty()
    @IsString({ message: 'El campo nombre debe ser de tipo string' })
    @MaxLength(1, { message: 'El campo nombre no puede tener mas de 1 caracter' })
    @Transform(({ value }) => value?.toUpperCase().trim())
    nombre: string;

    @IsNotEmpty()
    @IsUUID('4', { message: 'El campo campus_id debe ser de tipo uuid' })
    campus_id: string;
}
