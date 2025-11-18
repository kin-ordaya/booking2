import { PartialType } from '@nestjs/swagger';
import { CreateRecursoCursoPeriodoDto } from './create-recurso_curso_periodo.dto';

export class UpdateRecursoCursoPeriodoDto extends PartialType(CreateRecursoCursoPeriodoDto) {}
