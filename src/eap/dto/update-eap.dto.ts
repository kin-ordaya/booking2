import { PartialType } from '@nestjs/swagger';
import { CreateEapDto } from './create-eap.dto';

export class UpdateEapDto extends PartialType(CreateEapDto) {}
