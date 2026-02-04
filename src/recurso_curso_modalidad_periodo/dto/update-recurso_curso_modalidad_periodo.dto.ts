import { PartialType } from '@nestjs/swagger';
import { CreateRecursoCursoModalidadPeriodoDto } from './create-recurso_curso_modalidad_periodo.dto';

export class UpdateRecursoCursoModalidadPeriodoDto extends PartialType(CreateRecursoCursoModalidadPeriodoDto) {}
