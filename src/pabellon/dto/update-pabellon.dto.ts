import { PartialType } from '@nestjs/swagger';
import { CreatePabellonDto } from './create-pabellon.dto';

export class UpdatePabellonDto extends PartialType(CreatePabellonDto) {}
