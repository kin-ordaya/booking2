import { PartialType } from '@nestjs/swagger';
import { CreateModalidadDto } from './create-modalidad.dto';

export class UpdateModalidadDto extends PartialType(CreateModalidadDto) {}
