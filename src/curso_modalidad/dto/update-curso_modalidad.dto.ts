import { PartialType } from '@nestjs/swagger';
import { CreateCursoModalidadDto } from './create-curso_modalidad.dto';

export class UpdateCursoModalidadDto extends PartialType(CreateCursoModalidadDto) {}
