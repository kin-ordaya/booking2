import { PartialType } from '@nestjs/swagger';
import { CreateTipoRecursoDto } from './create-tipo_recurso.dto';

export class UpdateTipoRecursoDto extends PartialType(CreateTipoRecursoDto) {}
