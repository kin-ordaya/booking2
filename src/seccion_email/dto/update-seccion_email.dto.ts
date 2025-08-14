import { PartialType } from '@nestjs/swagger';
import { CreateSeccionEmailDto } from './create-seccion_email.dto';

export class UpdateSeccionEmailDto extends PartialType(CreateSeccionEmailDto) {}
