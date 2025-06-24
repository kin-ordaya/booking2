import { Type } from "class-transformer";
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, Matches, MaxLength } from "class-validator";

export class CreateReservaDto {

    @IsOptional()
    @IsInt()
    @IsIn([0, 1], {message: 'El campo mantenimiento debe ser 0 o 1'})
    @Type(() => Number)
    mantenimiento?: number;

    @IsOptional()
    @IsString()
    @MaxLength(100, {message: 'El campo descripcion debe tener un maximo de 100 caracteres'})
    descripcion?: string;

    @IsNotEmpty()
    @IsDateString()
    fecha: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, {message: 'El campo inicio debe tener el formato HH:MM'})
    inicio: string

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, {message: 'El campo fin debe tener el formato HH:MM'})
    fin: string

    @IsNotEmpty()
    @IsInt()
    @IsPositive({message: 'El campo cantidad_accesos debe ser positivo'})
    @Type(() => Number)
    cantidad_accesos: number;

    @IsNotEmpty()
    @IsUUID()
    recurso_id: string;

    @IsOptional()
    @IsUUID()
    clase_id?: string;

    @IsNotEmpty()
    @IsUUID()
    rol_usuario_id: string;
}
