import { PartialType } from '@nestjs/swagger';
import { CreateLaboratorioAulaDto } from './create-laboratorio_aula.dto';

export class UpdateLaboratorioAulaDto extends PartialType(CreateLaboratorioAulaDto) {}
