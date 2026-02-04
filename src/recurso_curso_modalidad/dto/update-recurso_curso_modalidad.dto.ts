import { PartialType } from '@nestjs/swagger';
import { CreateRecursoCursoModalidadDto } from './create-recurso_curso_modalidad.dto';

export class UpdateRecursoCursoModalidadDto extends PartialType(CreateRecursoCursoModalidadDto) {}
