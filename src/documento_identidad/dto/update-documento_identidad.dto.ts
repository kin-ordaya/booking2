import { PartialType } from '@nestjs/swagger';
import { CreateDocumentoIdentidadDto } from './create-documento_identidad.dto';

export class UpdateDocumentoIdentidadDto extends PartialType(CreateDocumentoIdentidadDto) {}
