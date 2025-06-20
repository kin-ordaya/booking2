import { PartialType } from '@nestjs/swagger';
import { CreateClaseAulaDto } from './create-clase_aula.dto';

export class UpdateClaseAulaDto extends PartialType(CreateClaseAulaDto) {}
