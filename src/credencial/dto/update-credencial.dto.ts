import { PartialType } from '@nestjs/swagger';
import { CreateCredencialDto } from './create-credencial.dto';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCredencialDto {
  @IsOptional()
  @IsString({ message: 'El campo usuario debe ser de tipo string' })
  usuario?: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo clave debe ser de tipo string' })
  clave: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo rol_id debe ser de tipo uuid' })
  rol_id: string;
}
