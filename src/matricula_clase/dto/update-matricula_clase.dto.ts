import { PartialType } from '@nestjs/swagger';
import { CreateMatriculaClaseDto } from './create-matricula_clase.dto';

export class UpdateMatriculaClaseDto extends PartialType(CreateMatriculaClaseDto) {}
