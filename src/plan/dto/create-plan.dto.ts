import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreatePlanDto {
    @IsNotEmpty()
    @IsString({ message: 'El campo nombre debe ser de tipo string' })
    @MaxLength(50, {
        message: 'El campo nombre no puede tener mas de 50 caracteres',
    })
    nombre: string;
}
