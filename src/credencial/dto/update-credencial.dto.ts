import { PartialType } from '@nestjs/swagger';
import { CreateCredencialDto } from './create-credencial.dto';

export class UpdateCredencialDto extends PartialType(CreateCredencialDto) {}
