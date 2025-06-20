import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
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
  inscritos: number;

  @IsNotEmpty()
  @IsString()
  @IsIn([
    '2024-0',
    '2024-1',
    '2024-2',
    '2025-0',
    '2025-1',
    '2025-2',
    '2026-0',
    '2026-1',
    '2026-2',
    '2027-0',
    '2027-1',
    '2027-2',
  ])
  periodo: string;

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
  @IsUUID()
  curso_modalidad_id: string;
}
