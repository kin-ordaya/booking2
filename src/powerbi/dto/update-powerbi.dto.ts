import { PartialType } from '@nestjs/swagger';
import { CreatePowerbiDto } from './create-powerbi.dto';

export class UpdatePowerbiDto extends PartialType(CreatePowerbiDto) {}
