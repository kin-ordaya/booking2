import { PartialType } from '@nestjs/swagger';
import { CreateRecursoCursoDto } from './create-recurso_curso.dto';

export class UpdateRecursoCursoDto extends PartialType(CreateRecursoCursoDto) {}
