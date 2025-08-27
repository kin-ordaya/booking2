import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID
} from 'class-validator';

export class CreateClaseDto {
  @IsNotEmpty()
  @IsString()
  nrc: string;

  @IsOptional()
  @IsString()
  nrc_secundario?: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  inscritos: number;

  // @IsNotEmpty()
  // @IsString()
  // @IsIn([
  //   '2024-00',
  //   '2024-10',
  //   '2024-20',
  //   '2025-00',
  //   '2025-10',
  //   '2025-20',
  //   '2026-00',
  //   '2026-10',
  //   '2026-20',
  //   '2027-00',
  //   '2027-10',
  //   '2027-20',
  // ])
  // periodo: string;

  // @IsNotEmpty()
  // @IsString()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => HorarioDiaDto)
  // horario: HorarioDiaDto[];

  //   @IsNotEmpty()
  //   @IsString()
  //   bloque: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['ESPECIALIDAD', 'TRANSVERSAL', 'GENERAL', 'CRUZADA'])
  tipo: string;

  @IsNotEmpty()
  @IsDateString()
  inicio: Date;

  @IsNotEmpty()
  @IsDateString()
  fin: Date;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo curso_modalidad_id debe ser de tipo uuid' })
  curso_modalidad_id: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo periodo_id debe ser de tipo uuid' })
  periodo_id: string;
}
