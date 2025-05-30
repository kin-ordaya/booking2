import { PartialType } from '@nestjs/swagger';
import { CreateResponsableDto } from './create-responsable.dto';

export class UpdateResponsableDto extends PartialType(CreateResponsableDto) {}
