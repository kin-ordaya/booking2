import { PartialType } from '@nestjs/swagger';
import { CreateDeclaracionJuradaDto } from './create-declaracion_jurada.dto';

export class UpdateDeclaracionJuradaDto extends PartialType(CreateDeclaracionJuradaDto) {}
